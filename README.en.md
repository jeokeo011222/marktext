<p align="center">
  <img src="https://raw.githubusercontent.com/jeokeo011222/marktext/develop/docs/assets/logo-small.png" alt="MarkText" width="110" height="110">
</p>

<h1 align="center">MarkText <sub>· Enhanced Fork</sub></h1>

<div align="center">
  <strong>Next-generation WYSIWYG markdown editor</strong><br>
  A simple, elegant, distraction-free markdown editor built on Electron + Vue 3 —<br>
  now with <b>smarter LaTeX handling</b> and <b>anydoc-powered document import</b>.
</div>

<br>

<div align="center">
  <img src="https://img.shields.io/static/v1?label=Platform&message=Linux%20%7C%20macOS%20%7C%20Windows&color=lightgrey" alt="platform">
  <img src="https://img.shields.io/github/license/jeokeo011222/marktext" alt="license">
  <img src="https://img.shields.io/badge/paste--LaTeX--auto--normalize-2ea44f" alt="tex-normalize">
  <img src="https://img.shields.io/badge/anydoc--Office%2FPDF--import-2ea44f" alt="anydoc-import">
  <img src="https://img.shields.io/badge/maintained-independently-blue" alt="maintained">
  <img src="https://img.shields.io/badge/upstream-marktext%2Fmarktext-blueviolet" alt="upstream">
</div>

<br>

<div align="center">
  <a href="https://marktext.me">Website</a> ·
  <a href="#-highlights-of-this-fork">Highlights</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-download--install">Download</a> ·
  <a href="#%EF%B8%8F-development">Development</a>
</div>

<br>

> [!NOTE]
> **🧪 这是一个独立维护的 fork（Independently maintained fork）。**
> 本仓库基于上游 [`marktext/marktext`](https://github.com/marktext/marktext) 的 `develop` 分支发展，**不向上游提交 PR**，独立维护以下两项增强。如果你只想用原版，请前往上游仓库下载官方构建。
>
> **This is an independent fork.** It is maintained separately from upstream and will **not** open PRs back to `marktext/marktext`. Two enhancements are carried as a local patch set (see [Relationship to upstream](#-relationship-to-upstream)).
>
> | 增强 Enhancement | 解决的问题 Problem it solves |
> | --- | --- |
> | 📐 **粘贴即归一化 LaTeX 定界符** | 从大模型对话 / JSON / 日志复制的公式常带二次转义（`\\(` `\\]` `\_`），原样粘贴会显示为源码 |
> | 📄 **anydoc 导入 Office / PDF** | 原导入仅支持 pandoc 的少数格式，PPT / Excel / PDF / RTF 无法导入 |

---

## 📋 Table of Contents

- [✨ Highlights of this fork](#-highlights-of-this-fork)
- [🎯 Features](#-features)
- [🖼️ Screenshot](#️-screenshot)
- [📥 Download & Install](#-download--install)
- [🛠️ Development](#️-development)
- [🔗 Relationship to upstream](#-relationship-to-upstream)
- [📜 License](#-license)

---

## ✨ Highlights of this fork

### 1. 📐 Paste LaTeX from anywhere — auto-normalized

Text copied from chat UIs, JSON payloads or log output often arrives escaped one
time too many: the delimiters come as `\( ... \)` / `\[ ... \]` and the math body
keeps escaped underscores. Neither form is a delimiter the editor parses, so the
paste lands as literal source text instead of rendered math.

**This fork rewrites such payloads to `$ ... $` / `$$ ... $$` the moment you paste** —
both with <kbd>Ctrl</kbd>+<kbd>V</kbd> and *Paste as Plain Text* — and drops the
HTML clipboard copy so the raw delimiters are not pasted back over the normalized
Markdown. Bodies without the escaping signature stay untouched, so a plain `\\`
line break in a matrix survives, as do escaped literal brackets in prose and any
content inside fenced or inline code.

> 中文：从大模型、JSON、日志里粘出来的公式常是二次转义形态（`\\(f\_\theta\\)`），粘贴后变成源码。**本 fork 在粘贴瞬间自动还原为标准 `$f_\theta$`**，无需手动改。代码块与行内代码内的内容不会被误改。

Before / after:

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

> 中文：原「导入」只支持 pandoc 能读的少数格式，**PPT / Excel / PDF / RTF 根本导不进来**。本 fork 新增 anydoc 通路，`File → Import` 现在支持上述全部格式，表格与标题结构完整保留。

---

## 🎯 Features

- 📝 **Real-time WYSIWYG preview** with a clean, distraction-free interface.
- 📐 **Math expressions** rendered with KaTeX, plus front matter and emoji support.
- 📊 **Diagrams** via Mermaid and PlantUML.
- 📑 **Outline / table of contents** for long documents.
- 🌗 **Multiple editing modes**: Source Code, Typewriter and Focus mode.
- 🎨 **Various themes**: Cadmium Light, Material Dark and more.
- 🖼️ **Paste images** directly from the clipboard.
- 📤 **Export** to HTML and PDF.
- ✅ **CommonMark + GitHub Flavored Markdown** conformance.
- ⌨️ Paragraph and inline-style shortcuts to speed up writing.
- 📐📄 **(fork) Auto-normalized LaTeX on paste** and **anydoc document import** — see [Highlights](#-highlights-of-this-fork).

---

## 🖼️ Screenshot

![MarkText](https://raw.githubusercontent.com/jeokeo011222/marktext/develop/docs/assets/marktext.png?raw=true)

---

## 📥 Download & Install

The two enhancements above are **not yet published as official installers**. You have two options:

1. **Use the upstream release** for a stable, signed build — just without the fork enhancements:
   👉 <https://github.com/marktext/marktext/releases/latest>
2. **Build this fork from source** to get the LaTeX + anydoc features (see [Development](#️-development)).

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
> skips native compilation, run `pnpm rebuild` afterwards.

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
- The two enhancements are carried as a small, reviewable **patch set** on top of the
  base. To bring in upstream changes later:

  ```bash
  git remote add upstream https://github.com/marktext/marktext.git
  git fetch upstream
  git rebase upstream/develop     # replay the fork patches onto the new base
  ```

- All credit for the editor engine, UI and ecosystem goes to the MarkText authors
  and contributors. This fork only adds the two focused enhancements described above.

---

## 📜 License

Released under the **MIT License** — same as upstream. See [LICENSE](LICENSE).
