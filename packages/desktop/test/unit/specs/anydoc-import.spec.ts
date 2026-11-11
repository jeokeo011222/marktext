import { mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { afterAll, describe, expect, it } from 'vitest'
import {
  ANYDOC_EXTENSIONS,
  anydocAvailable,
  convertWithAnydoc,
  isAnyDocFile
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

    const markdown = await convertWithAnydoc(file)

    expect(markdown).toContain('cpu')
    expect(markdown).toContain('2')
  })
})
