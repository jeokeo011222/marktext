<p align="center">
  <img src="https://raw.githubusercontent.com/jeokeo011222/marktext/develop/docs/assets/logo-small.png" alt="MarkText" width="110" height="110">
</p>

<h1 align="center">MarkText <sub>· Enhanced Fork</sub></h1>

<div align="center">
  <strong>Next-generation WYSIWYG markdown editor</strong><br>
  A simple, elegant, distraction-free markdown editor built on Electron + Vue 3 —<br>
  tuned for engineering and academic writing: paste-ready math, numbered equations,<br>
  and document import that keeps tables <em>and</em> images.
</div>

<br>

<div align="center">
  <img src="https://img.shields.io/static/v1?label=Platform&message=Linux%20%7C%20macOS%20%7C%20Windows&color=lightgrey" alt="platform">
  <img src="https://img.shields.io/github/license/jeokeo011222/marktext" alt="license">
  <img src="https://img.shields.io/badge/paste--LaTeX--auto--normalize-2ea44f" alt="tex-normalize">
  <img src="https://img.shields.io/badge/KaTeX--paper--compat-ff69b4" alt="katex-compat">
  <img src="https://img.shields.io/badge/anydoc--Office%2FPDF--import-2ea44f" alt="anydoc-import">
  <img src="https://img.shields.io/badge/embedded--images--restored-orange" alt="image-restore">
  <img src="https://img.shields.io/badge/maintained-independently-blue" alt="maintained">
  <img src="https://img.shields.io/badge/upstream-marktext%2Fmarktext-blueviolet" alt="upstream">
</div>

<br>

<div align="center">
  <a href="https://github.com/jeokeo011222/marktext#readme">Project home</a> ·
  <a href="#-highlights-of-this-fork">Highlights</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-download--install">Download</a> ·
  <a href="#%EF%B8%8F-development">Development</a> ·
  <a href="README.md">中文</a>
</div>

<br>

> [!NOTE]
> **This is an independently maintained fork** of [`marktext/marktext`](https://github.com/marktext/marktext), based on its `develop` branch. It does **not** open PRs back upstream. On top of the untouched original feature set it carries **six enhancements**: auto-normalized LaTeX on paste, anydoc document import, embedded-image extraction on import, visible import-failure feedback, a paper-grade KaTeX compatibility layer, and single-backslash math delimiters enabled by default. If you only need the original, download the official upstream build.
>
> 中文：这是独立维护的分支，不向上游提交 PR；原版功能完整保留，另叠加六项增强。详见 [README.md](README.md)。

---

## 📋 Table of Contents

- [✨ Highlights of this fork](#-highlights-of-this-fork)
- [🎯 Features](#-features)
- [🖼️ Screenshot](#️-screenshot)
- [📥 Download & Install](#-download--install)
- [🛠️ Development](#️-development)
- [🔗 Relationship to upstream](#-relationship-to-upstream)
- [📜 License](#-license)
- [🙏 Credits & links](#-credits--links)

---

## ✨ Highlights of this fork

### 1. 📐 Paste LaTeX from anywhere — auto-normalized

Text copied from chat UIs, JSON payloads or log output often arrives escaped one
time too many: the delimiters come as `\\( ... \\)` / `\\[ ... \\]` and the math body
keeps escaped underscores. Neither form is a delimiter the editor parses, so the
paste lands as literal source text instead of rendered math.

**This fork rewrites such payloads to `$ ... $` / `$$ ... $$` the moment you paste** —
both with <kbd>Ctrl</kbd>+<kbd>V</kbd> and *Paste as Plain Text* — and drops the
HTML clipboard copy so the raw delimiters are not pasted back over the normalized
Markdown. Bodies without the escaping signature stay untouched, so a plain `\\`
line break in a matrix survives, as do escaped literal brackets in prose and any
content inside fenced or inline code.

```diff
- 设模型为 \\(f\_\theta\\)，其计算结构为 \\[ G_T=(V_T,E_T,W_T) \\]
+ 设模型为 $f_\theta$，其计算结构为
+ $$ G_T=(V_T,E_T,W_T) $$
```

### 2. 📄 Import Office, PDF and RTF with anydoc

The original *File → Import* path only knew the formats pandoc reads — five of the
fourteen that anydoc covers. PowerPoint, Excel, PDF and RTF were not importable at
all, and `.docx` came through with tables flattened.

**This fork dispatches by extension** and routes the formats below through
[`@firecrawl/anydoc`](https://github.com/firecrawl/anydoc) — a Rust document
parser that keeps tables, headings and structure intact:

| Routed to **anydoc** (new)        | Still routed to **pandoc** |
| --------------------------------- | --------------------------- |
| doc / docx / docm                 | html                        |
| ppt / pptx / pps                 | latex / rst / org           |
| xls / xlsx                       | wiki / opml / textile       |
| odt / ods / odp                  |                             |
| rtf · epub · csv · **pdf**       |                             |

anydoc is a napi binding loaded lazily; a host without the platform binary
gracefully falls back to pandoc instead of failing to boot.

### 3. 🖼️ Bring embedded images along on import

`toMarkdown()` only returns text, so every picture inside a `.docx`/`.pptx` used to
be silently dropped — all that remained was an alt string. This fork also reads
anydoc's document model (`toDocument()`), writes each asset into an `assets/`
folder next to the source file, and reinserts `![...](...)` near the image's
original position using the surrounding text as an anchor. Unmatched images are
never discarded: they are listed under an **"Imported images"** appendix.

A notification reports how many images were extracted, how many were placed back,
how many were appended, and where the files landed. Formats without a document
model (notably PDF) still import as plain text — they simply do not fail.

### 4. 🔔 Import failures are visible and actionable

A scanned PDF raising `needsOcr`, an encrypted document, an unsupported format,
a malformed package, a resource limit, an unreadable file or a hosted-conversion
error used to produce nothing but a line in the log. The failure code is now
translated into an in-app notification with a concrete remedy — e.g. *"This PDF has
scanned pages; anydoc does not do OCR, run OCR on those pages first"*. Messages are
localized across all 13 UI languages.

### 5. 🧮 Paper-grade KaTeX compatibility (no engine swap)

KaTeX renders one formula at a time and knows nothing about LaTeX document state.
Instead of replacing it with MathJax — slower live rendering, and KaTeX is already
inlined into the renderer bundle — a compatibility pass rewrites those constructs
into KaTeX equivalents before rendering:

| Construct | Handling |
| :--- | :--- |
| `\label{}` / `\ref{}` / `\eqref{}` | Document-wide numbering registry, rewritten to `\tag` and literal numbers; unresolved references render as `??` and resolve on the next render, matching LaTeX's two-pass behaviour |
| `\newcommand` / `\renewcommand` / `\providecommand` / `\def` | Extracted into KaTeX `macros`, with balanced-brace macro bodies |
| `\tag{}` | Custom numbers are kept and do not consume the counter |
| `\nonumber` / `\notag` / `\numberwithin` / `\allowdisplaybreaks` | Document-level commands with no meaning in a single formula are stripped |

Numbering is reset per document, so labels never leak between tabs. Display
formulas with a `\label` are numbered by default; an *auto-number all* option is
available. `align` / `gather` / `equation` environments and `\ce{}` are already
native to KaTeX + mhchem and are deliberately left alone.

### 6. ⌨️ Single-backslash math delimiters on by default

The `texMathSingleBackslash` preference existed upstream but defaulted to `false`,
so `\(...\)` / `\[...\]` from LaTeX sources and chat tools showed up as raw text.
The default is now `true`, with a **one-time migration** for existing
`preferences.json` files (a marker is written, so a user who turns the option off
keeps that choice on every restart). The preference label is marked *recommended*
in all 13 languages.

> All six enhancements are carried as small, reviewable patches with unit tests —
> mainly in `packages/muya/src/clipboard/`, `packages/muya/src/utils/katexCompat.ts`,
> `packages/desktop/src/main/utils/anydoc.ts` and
> `packages/desktop/src/main/menu/actions/file.ts`.

---

## 🎯 Features

- 📝 **Real-time WYSIWYG preview** with a clean, distraction-free interface.
- 📐 **Math expressions** rendered with KaTeX, `$…$` / `$$…$$` / `\(…\)` / `\[…\]`, equation numbering, cross-references, macros and mhchem.
- 📊 **Diagrams** via Mermaid 12, PlantUML, Vega-Lite, flowchart and sequence.
- 📑 **Outline / table of contents** for long documents.
- 🌗 **Multiple editing modes**: Source Code, Typewriter and Focus mode.
- 🎨 **Various themes**: Cadmium Light, Material Dark and more.
- 🖼️ **Paste images** directly from the clipboard; embedded images are restored on import.
- 📤 **Export** to HTML, PDF and pandoc formats.
- ✅ **CommonMark + GitHub Flavored Markdown** conformance.
- ⌨️ Paragraph and inline-style shortcuts to speed up writing.
- 📐📄 **(fork)** The six enhancements above — see [Highlights](#-highlights-of-this-fork).

---

## 🖼️ Screenshot

![MarkText](https://raw.githubusercontent.com/jeokeo011222/marktext/develop/docs/assets/marktext.png?raw=true)

---

## 📥 Download & Install

The fork enhancements are **not yet published as official installers**. You have two options:

1. **Use the upstream release** for a stable, signed build — just without the fork enhancements:
   👉 <https://github.com/marktext/marktext/releases/latest>
2. **Build this fork from source** to get all six enhancements (see [Development](#️-development)).
   This fork's own release page: <https://github.com/jeokeo011222/marktext/releases>

Requires **Windows 10/11, macOS 13+ or a modern Linux** distribution.

---

## 🛠️ Development

This is a pnpm workspace. All commands run from the repo root.

```bash
# Install dependencies (downloads Electron, rebuilds native modules)
pnpm install

# Run in development mode (renderer hot-reloads)
pnpm run dev

# Build without packaging — fast path to verify the renderer/main compile
pnpm run build:unpack

# Package installers for your platform
pnpm run build:win     # Windows x64 / arm64 — NSIS installer + zip
pnpm run build:mac     # macOS — DMG + zip
pnpm run build:linux   # Linux — AppImage, snap, deb, rpm, tar.gz
```

> ⚠️ On Windows, native modules (`ced`, `native-keymap`, …) are compiled with
> `node-gyp` and need the **VS 2022 (or newer) C++ build tools**. If `pnpm install`
> skips native compilation, run `pnpm rebuild` afterwards. anydoc ships a platform
> binary, so keep the `asarUnpack` entry intact when packaging.

Tests & checks:

```bash
pnpm run test          # desktop unit tests (Vitest)
pnpm run test:e2e      # end-to-end tests (Playwright)
pnpm run lint          # ESLint (run before committing)
pnpm run typecheck     # vue-tsc --noEmit
```

---

## 🔗 Relationship to upstream

- This repository is a **fork** of [`marktext/marktext`](https://github.com/marktext/marktext),
  tracking its `develop` branch as the base.
- It is **maintained independently** and does **not** open pull requests back to upstream.
- The six enhancements are carried as a small, reviewable **patch set** on top of the
  base. To bring in upstream changes later:

  ```bash
  git remote add upstream https://github.com/marktext/marktext.git
  git fetch upstream
  git rebase upstream/develop     # replay the fork patches onto the new base
  ```

- All credit for the editor engine, UI and ecosystem goes to the MarkText authors
  and contributors. This fork only adds the six focused enhancements described above.

---

## 📜 License

Released under the **MIT License** — same as upstream. See [LICENSE](LICENSE).

---

## 🙏 Credits & links

Almost everything here is the work of **[marktext/marktext](https://github.com/marktext/marktext)** —
our thanks to [**Jocs**](https://github.com/Jocs), the
[contributors](https://github.com/marktext/marktext/graphs/contributors), and the
community behind Muya, the themes, the translations and the cross-platform build
chain. Thanks also to KaTeX, Mermaid, PlantUML, Vega-Lite, pandoc, anydoc,
Electron and Vue. **All credit belongs to the original project; any defects in
this fork are ours.**

| | |
| :--- | :--- |
| This fork · README | <https://github.com/jeokeo011222/marktext#readme> |
| This fork · releases | <https://github.com/jeokeo011222/marktext/releases> |
| This fork · issues | <https://github.com/jeokeo011222/marktext/issues> |
| Original repository | <https://github.com/marktext/marktext> |
| Official website | <https://marktext.me> |
| Support the original | <https://github.com/sponsors/marktext> |

If MarkText makes your writing easier, please consider supporting the original project. ❤️
