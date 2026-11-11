import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { PreferenceFile, preferenceDefaults } from 'main_renderer/preferences/preferenceFile'

const DEFAULTS_PATH = path.join(__dirname, '../../../static/preference.json')
const SCHEMA_PATH = path.join(__dirname, '../../../src/shared/preferences/schema.json')
const MIGRATION_KEY = 'texMathSingleBackslashDefaultV2'

const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8')) as Record<string, { default?: unknown }>
const bundled = JSON.parse(readFileSync(DEFAULTS_PATH, 'utf8')) as Record<string, unknown>

// `\(...\)` and `\[...\]` are what LaTeX, pandoc and most chat/model output
// emit. Leaving the extension off by default made pasted formulas look like
// source text, so it is now on everywhere a default can come from.
describe('single-backslash TeX math is enabled by default', () => {
  it('is the schema default', () => {
    expect(schema.texMathSingleBackslash?.default).toBe(true)
  })

  it('is the bundled default, which overrides the schema at load time', () => {
    expect(bundled.texMathSingleBackslash).toBe(true)
  })

  it('is what preferenceDefaults hands to a fresh profile', () => {
    expect(preferenceDefaults().texMathSingleBackslash).toBe(true)
  })
})

describe('one-time migration of existing profiles', () => {
  const withProfile = (value: Record<string, unknown>, run: (file: PreferenceFile, writes: string[]) => void): void => {
    const dir = mkdtempSync(path.join(tmpdir(), 'mt-tex-default-'))
    const writes: string[] = []
    try {
      writeFileSync(path.join(dir, 'preferences.json'), JSON.stringify(value))
      const file = new PreferenceFile(dir, {
        write: (_pathname, contents) => {
          writes.push(contents)
        }
      })
      run(file, writes)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  }

  it('upgrades an old explicit false and records the marker', () => {
    withProfile({ texMathSingleBackslash: false }, (file, writes) => {
      expect(file.get().texMathSingleBackslash).toBe(true)
      expect(writes).toHaveLength(1)
      const written = JSON.parse(writes[0])
      expect(written.texMathSingleBackslash).toBe(true)
      expect(written[MIGRATION_KEY]).toBe(true)
    })
  })

  it('upgrades a profile that never stored the key', () => {
    withProfile({ theme: 'dark' }, (file) => {
      expect(file.get().texMathSingleBackslash).toBe(true)
    })
  })

  it('does not turn the option back on after the user disabled it', () => {
    withProfile({ texMathSingleBackslash: false, [MIGRATION_KEY]: true }, (file, writes) => {
      expect(file.get().texMathSingleBackslash).toBe(false)
      expect(writes).toHaveLength(0)
    })
  })
})
