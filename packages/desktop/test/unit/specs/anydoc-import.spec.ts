import { mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { afterAll, describe, expect, it } from 'vitest'
import {
  ANYDOC_EXTENSIONS,
  anydocAvailable,
  convertWithAnydoc,
  isAnyDocFile,
  placeImagesInMarkdown
} from 'main_renderer/utils/anydoc'

// anydoc takes over the import formats pandoc either refuses or flattens, and
// pandoc keeps the ones anydoc has no parser for. The dispatch is by extension,
// so a misjudged list silently sends files to the wrong converter.
describe('anydoc import dispatch', () => {
  it('claims the Office, PDF and RTF formats', () => {
    for (const ext of ['docx', 'doc', 'docm', 'pptx', 'xlsx', 'pdf', 'rtf', 'odt', 'epub', 'csv']) {
      expect(isAnyDocFile(`/notes/report.${ext}`)).toBe(true)
    }
  })

  it('leaves the pandoc-only formats alone', () => {
    for (const ext of ['html', 'tex', 'rst', 'org', 'wiki', 'textile', 'opml', 'md']) {
      expect(isAnyDocFile(`/notes/report.${ext}`)).toBe(false)
    }
  })

  it('matches the extension without regard to case', () => {
    expect(isAnyDocFile('C:\\notes\\REPORT.DOCX')).toBe(true)
    expect(isAnyDocFile('C:\\notes\\REPORT.Pdf')).toBe(true)
  })

  it('does not claim a name that merely ends with the letters', () => {
    expect(isAnyDocFile('/notes/mypdf')).toBe(false)
    expect(isAnyDocFile('/notes/report.pdf.bak')).toBe(false)
  })

  it('offers every extension it claims', () => {
    expect(new Set(ANYDOC_EXTENSIONS).size).toBe(ANYDOC_EXTENSIONS.length)
  })
})

describe('anydoc binding', () => {
  const dirs: string[] = []

  afterAll(() => {
    for (const dir of dirs) rmSync(dir, { recursive: true, force: true })
    dirs.length = 0
  })

  it('reports availability without throwing when the binary is missing', async() => {
    // A packaged build without the platform binary must boot and fall back to
    // pandoc, so this resolves either way rather than rejecting.
    await expect(anydocAvailable()).resolves.toBeTypeOf('boolean')
  })

  it('converts a document through the binding', async() => {
    if (!(await anydocAvailable())) return

    const dir = mkdtempSync(path.join(tmpdir(), 'anydoc-import-'))
    dirs.push(dir)
    const file = path.join(dir, 'hardware.csv')
    writeFileSync(file, 'name,qty\ncpu,2\n')

    const result = await convertWithAnydoc(file)

    expect(result.markdown).toContain('cpu')
    expect(result.markdown).toContain('2')
    expect(result.assetCount).toBe(0)
  })
})

// `toMarkdown` drops embedded images entirely; the document model is the only
// place their bytes and positions survive. These cases cover the reinsertion
// heuristic without needing a native binary or a real Office file.
describe('anydoc image restoration', () => {
  const urls = new Map([
    [0, 'file:///C:/notes/assets/anydoc-report-0.png'],
    [1, 'file:///C:/notes/assets/anydoc-report-1.png']
  ])
  const markdown = '## 一、引言\n\n正文段落。\n\n## 三、具体计算说明\n\n结尾。'

  it('puts an image before the heading that followed it in the source', () => {
    const result = placeImagesInMarkdown(
      markdown,
      [{ assetId: 0, anchor: '三、具体计算说明', before: true }],
      urls,
      '导入的图片'
    )

    expect(result.placed).toBe(1)
    expect(result.appended).toBe(0)
    expect(result.markdown).toContain('![image-0](file:///C:/notes/assets/anydoc-report-0.png)')
    expect(result.markdown.indexOf('![image-0]')).toBeLessThan(result.markdown.indexOf('## 三、具体计算说明'))
  })

  it('puts an image after a preceding anchor when no following one exists', () => {
    const result = placeImagesInMarkdown(
      markdown,
      [{ assetId: 0, anchor: '正文段落', before: false }],
      urls,
      '导入的图片'
    )

    expect(result.placed).toBe(1)
    expect(result.markdown.indexOf('正文段落')).toBeLessThan(result.markdown.indexOf('![image-0]'))
  })

  it('appends images with no usable anchor instead of dropping them', () => {
    const result = placeImagesInMarkdown(
      markdown,
      [{ assetId: 1, anchor: null, before: false }],
      urls,
      '导入的图片'
    )

    expect(result.placed).toBe(0)
    expect(result.appended).toBe(1)
    expect(result.markdown).toContain('## 导入的图片')
    expect(result.markdown).toContain('![image-1]')
  })

  it('keeps several images sharing one anchor in their original order', () => {
    const result = placeImagesInMarkdown(
      markdown,
      [
        { assetId: 0, anchor: '三、具体计算说明', before: true },
        { assetId: 1, anchor: '三、具体计算说明', before: true }
      ],
      urls,
      '导入的图片'
    )

    expect(result.placed).toBe(2)
    expect(result.markdown.indexOf('![image-0]')).toBeLessThan(result.markdown.indexOf('![image-1]'))
  })

  it('leaves the document alone when no asset could be written', () => {
    const result = placeImagesInMarkdown(markdown, [{ assetId: 0, anchor: null, before: false }], new Map(), 'x')
    expect(result.markdown).toBe(markdown)
    expect(result.placed + result.appended).toBe(0)
  })
})
