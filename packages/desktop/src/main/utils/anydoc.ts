/**
 * anydoc converts Office documents, PDF and EPUB to GitHub-flavored Markdown.
 * It covers the import list pandoc handles badly (PDF, PowerPoint, Excel, RTF,
 * the legacy binary Office formats) and parses `.docx`/`.odt`/`.epub` more
 * faithfully, so those extensions are dispatched here and everything else still
 * goes through pandoc.
 *
 * `toMarkdown` deliberately drops embedded images: Markdown cannot carry bytes,
 * and an image with no alt text leaves no trace at all in the output. The bytes
 * do survive on `Document.assets`, so this module also reads the document model,
 * writes every asset next to the imported file and puts the image references
 * back into the Markdown.
 */

import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { pathToFileURL } from 'url'
import log from 'electron-log'

/** Formats anydoc parses. The rest of the import list has no anydoc equivalent. */
export const ANYDOC_EXTENSIONS: readonly string[] = Object.freeze([
  'doc',
  'docm',
  'docx',
  'ppt',
  'pptm',
  'pptx',
  'pps',
  'ppsm',
  'ppsx',
  'xls',
  'xlsb',
  'xlsm',
  'xlsx',
  'odt',
  'ods',
  'odp',
  'rtf',
  'epub',
  'csv',
  'pdf'
])

export const isAnyDocFile = (pathname: string): boolean => {
  const lower = pathname.toLowerCase()
  return ANYDOC_EXTENSIONS.some(ext => lower.endsWith(`.${ext}`))
}

export interface AnyDocConversion {
  markdown: string
  /** Number of embedded assets written to disk. */
  assetCount: number
  /** Images reinserted near their original position. */
  placedCount: number
  /** Images that had no usable anchor and were appended at the end. */
  appendedCount: number
  /** True when the document model could not be read (PDF, or a parse failure). */
  assetsUnavailable: boolean
  /** Directory the assets were written to, for the success notification. */
  assetDirectory: string | null
}

interface AnyDocModule {
  toMarkdown: (pathname: string) => Promise<string>
  toDocument: (bytes: Uint8Array, format?: unknown) => Promise<AnyDocDocument>
  formatFromPath: (pathname: string) => unknown
}

interface AnyDocDocument {
  blocks: AnyDocBlock[]
  assets: Array<{ id: number; mediaType: string; originPart: string; data: Buffer }>
}

interface AnyDocBlock {
  kind: string
  content?: Array<{ kind: string; text?: string; alt?: string; source?: { kind: string; assetId?: number } }>
  blocks?: AnyDocBlock[]
  list?: { items: Array<{ blocks: AnyDocBlock[] }> }
  table?: { grid: Array<Array<{ cell?: { blocks: AnyDocBlock[] } }>> }
}

let anydocModule: AnyDocModule | null | undefined

/**
 * anydoc resolves a per-platform napi binary when it is first required, so a
 * host without one throws at load rather than at call. Import it lazily and
 * treat a failure as "unavailable": a packaged build missing the binary must
 * still start and fall back to pandoc.
 */
const loadAnydoc = async(): Promise<AnyDocModule | null> => {
  if (anydocModule !== undefined) return anydocModule
  try {
    const mod = await import('@firecrawl/anydoc')
    anydocModule = mod as unknown as AnyDocModule
  } catch (err) {
    log.warn('anydoc native binding unavailable; falling back to pandoc:', err)
    anydocModule = null
  }
  return anydocModule
}

export const anydocAvailable = async(): Promise<boolean> => (await loadAnydoc()) !== null

const MIME_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
  'image/x-emf': 'emf',
  'image/x-wmf': 'wmf'
}

const assetExtension = (asset: AnyDocDocument['assets'][number]): string => {
  const fromMime = MIME_EXTENSIONS[asset.mediaType.toLowerCase()]
  if (fromMime) return fromMime
  const fromOrigin = path.extname(asset.originPart).replace(/^\./, '').toLowerCase()
  return /^[a-z0-9]{1,5}$/.test(fromOrigin) ? fromOrigin : 'bin'
}

/** Flatten the document model into reading order so an image can borrow a neighbour's text. */
const flattenBlocks = (blocks: AnyDocBlock[]): AnyDocBlock[] => {
  const result: AnyDocBlock[] = []
  const visit = (list: AnyDocBlock[]): void => {
    for (const block of list) {
      result.push(block)
      if (block.blocks) visit(block.blocks)
      if (block.list) block.list.items.forEach(item => visit(item.blocks))
      if (block.table) {
        for (const row of block.table.grid) {
          for (const slot of row) if (slot.cell) visit(slot.cell.blocks)
        }
      }
    }
  }
  visit(blocks)
  return result
}

/**
 * Fingerprints a block's visible text. Markdown decoration is stripped so the
 * fingerprint also matches a `## heading` or a bold run in the output.
 */
const blockText = (block: AnyDocBlock): string => {
  const raw = (block.content ?? [])
    .filter(inline => inline.kind === 'text' || inline.kind === 'math')
    .map(inline => inline.text ?? '')
    .join('')
  return raw.replace(/[\s*_`#>~[\]()]/g, '')
}

const neighbourAnchor = (blocks: AnyDocBlock[], index: number): { text: string; before: boolean } | null => {
  // A picture usually sits in its own paragraph between two text blocks.
  // Prefer the following one (headings are especially reliable), else the previous.
  for (let i = index + 1; i < blocks.length; i++) {
    const text = blockText(blocks[i])
    if (text.length >= 4) return { text: text.slice(0, 24), before: true }
  }
  for (let i = index - 1; i >= 0; i--) {
    const text = blockText(blocks[i])
    if (text.length >= 4) return { text: text.slice(0, 24), before: false }
  }
  return null
}

export interface ImageSlot {
  assetId: number
  anchor: string | null
  before: boolean
}

const collectImageSlots = (doc: AnyDocDocument): ImageSlot[] => {
  const blocks = flattenBlocks(doc.blocks)
  const slots: ImageSlot[] = []
  blocks.forEach((block, index) => {
    const ids = (block.content ?? []).flatMap(inline => {
      const source = inline.kind === 'image' ? inline.source : undefined
      return source?.kind === 'asset' && typeof source.assetId === 'number' ? [source.assetId] : []
    })
    if (!ids.length) return
    const anchor = neighbourAnchor(blocks, index)
    ids.forEach(assetId => slots.push({ assetId, anchor: anchor?.text ?? null, before: anchor?.before ?? false }))
  })
  return slots
}

/**
 * Imported documents open as an untitled tab, so a relative `assets/` link has
 * no base to resolve against. Write beside the source and reference the file
 * by absolute `file://` URL, which muya's image loader accepts as-is.
 */
const writeAssets = async(
  pathname: string,
  doc: AnyDocDocument
): Promise<{ urls: Map<number, string>; directory: string | null }> => {
  const urls = new Map<number, string>()
  if (!doc.assets.length) return { urls, directory: null }

  const directory = path.join(path.dirname(pathname), 'assets')
  const slug = path.basename(pathname, path.extname(pathname)).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) || 'import'
  try {
    await mkdir(directory, { recursive: true })
    for (const asset of doc.assets) {
      const filename = `anydoc-${slug}-${asset.id}.${assetExtension(asset)}`
      const target = path.join(directory, filename)
      await writeFile(target, asset.data)
      urls.set(asset.id, pathToFileURL(target).href)
    }
  } catch (err) {
    log.error('Failed to write imported assets:', err)
    return { urls: new Map(), directory: null }
  }
  return { urls, directory }
}

const imageReference = (url: string, name: string): string => `![${name}](${url})`

/** Put each image back at its approximate position; anything unmatched goes to an appendix. */
export const placeImagesInMarkdown = (markdown: string, slots: ImageSlot[], urls: Map<number, string>, appendixTitle: string): {
  markdown: string
  placed: number
  appended: number
} => {
  if (!urls.size) return { markdown, placed: 0, appended: 0 }

  const lines = markdown.split('\n')
  // Line index -> references to insert there. Allocations are computed against
  // the original lines and applied in one pass, so insertions never shift each other.
  const insertions = new Map<number, string[]>()
  const leftovers: string[] = []

  for (const slot of slots) {
    const url = urls.get(slot.assetId)
    if (!url) continue
    const reference = imageReference(url, `image-${slot.assetId}`)
    const anchorText = slot.anchor
    let lineIndex = -1
    if (anchorText) {
      lineIndex = lines.findIndex(line => line.replace(/[\s*_`#>~[\]()]/g, '').includes(anchorText))
    }
    if (lineIndex < 0) {
      leftovers.push(reference)
      continue
    }
    const target = slot.before ? lineIndex : lineIndex + 1
    const bucket = insertions.get(target) ?? []
    bucket.push(reference)
    insertions.set(target, bucket)
  }

  const placed = insertions.size ? Array.from(insertions.values()).reduce((n, refs) => n + refs.length, 0) : 0
  const output: string[] = []
  for (let i = 0; i <= lines.length; i++) {
    const refs = insertions.get(i)
    if (refs) {
      if (output.length && output[output.length - 1] !== '') output.push('')
      refs.forEach(ref => output.push(ref, ''))
    }
    if (i < lines.length) output.push(lines[i])
  }

  if (leftovers.length || placed) {
    // Unmatched images are still on disk; list them so nothing is silently lost.
    if (leftovers.length) {
      output.push('', `## ${appendixTitle}`, '', ...leftovers.flatMap(ref => [ref, '']))
    }
  }
  return { markdown: output.join('\n'), placed, appended: leftovers.length }
}

/**
 * Convert `pathname` to Markdown; rejects with anydoc's `code` on the error.
 * `appendixTitle` is supplied by the caller so this utility stays free of i18n.
 */
export const convertWithAnydoc = async(
  pathname: string,
  appendixTitle = 'Imported images'
): Promise<AnyDocConversion> => {
  const mod = await loadAnydoc()
  if (!mod) throw new Error('anydoc is not available on this platform')

  const markdown = await mod.toMarkdown(pathname)

  // PDF is converted through pdf-inspector, which has no document-model form,
  // so there is no asset list to recover there. Do not fail the import for it.
  let doc: AnyDocDocument | null = null
  try {
    const bytes = new Uint8Array(await readFile(pathname))
    doc = await mod.toDocument(bytes, mod.formatFromPath(pathname))
  } catch (err) {
    log.warn('anydoc document model unavailable for assets:', err)
  }

  if (!doc || !doc.assets?.length) {
    return { markdown, assetCount: 0, placedCount: 0, appendedCount: 0, assetsUnavailable: !doc, assetDirectory: null }
  }

  const { urls, directory } = await writeAssets(pathname, doc)
  const restored = placeImagesInMarkdown(markdown, collectImageSlots(doc), urls, appendixTitle)
  return {
    markdown: restored.markdown,
    assetCount: urls.size,
    placedCount: restored.placed,
    appendedCount: restored.appended,
    assetsUnavailable: false,
    assetDirectory: directory
  }
}
