/**
 * anydoc converts Office documents, PDF and EPUB to GitHub-flavored Markdown.
 * It covers the import list pandoc handles badly (PDF, PowerPoint, Excel, RTF,
 * the legacy binary Office formats) and parses `.docx`/`.odt`/`.epub` more
 * faithfully, so those extensions are dispatched here and everything else still
 * goes through pandoc.
 */

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

type ToMarkdown = (pathname: string) => Promise<string>

let toMarkdown: ToMarkdown | null | undefined

/**
 * anydoc resolves a per-platform napi binary when it is first required, so a
 * host without one throws at load rather than at call. Import it lazily and
 * treat a failure as "unavailable": a packaged build missing the binary must
 * still start and fall back to pandoc.
 */
const loadToMarkdown = async(): Promise<ToMarkdown | null> => {
  if (toMarkdown !== undefined) return toMarkdown
  try {
    const mod = await import('@firecrawl/anydoc')
    toMarkdown = mod.toMarkdown
  } catch {
    toMarkdown = null
  }
  return toMarkdown
}

export const anydocAvailable = async(): Promise<boolean> => (await loadToMarkdown()) !== null

/** Convert `pathname` to Markdown; rejects with anydoc's `code` on the error. */
export const convertWithAnydoc = async(pathname: string): Promise<string> => {
  const convert = await loadToMarkdown()
  if (!convert) throw new Error('anydoc is not available on this platform')
  return convert(pathname)
}
