<p align="center">
  <img src="https://raw.githubusercontent.com/jeokeo011222/marktext/develop/docs/assets/logo-small.png" alt="MarkText" width="110" height="110">
</p>

<h1 align="center">MarkText · 增强版</h1>

<div align="center">
  <strong>一款简洁、优雅、所见即所得的开源 Markdown 编辑器</strong><br>
  基于 Electron + Vue 3，专注速度与易用性，让写作回到内容本身。<br>
  面向工程与科研写作：公式粘贴即用、论文公式可编号、既有文档连图带表一起导入。<br>
  支持 Windows、macOS、Linux。
</div>

<br>

<div align="center">
  <img src="https://img.shields.io/badge/平台-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey" alt="平台">
  <img src="https://img.shields.io/badge/协议-MIT-blue" alt="协议">
  <img src="https://img.shields.io/badge/编辑器-所见即所得-2ea44f" alt="WYSIWYG">
  <img src="https://img.shields.io/badge/公式-KaTeX%20兼容层-ff69b4" alt="KaTeX">
  <img src="https://img.shields.io/badge/文档导入-anydoc-2ea44f" alt="anydoc">
  <img src="https://img.shields.io/badge/图片导入-自动落盘-orange" alt="assets">
  <img src="https://img.shields.io/badge/维护-独立分支-blueviolet" alt="独立分支">
</div>

<br>

<div align="center">
  <a href="#overview">功能一览</a> ·
  <a href="#fork-extras">本分支增强</a> ·
  <a href="#screenshot">截图</a> ·
  <a href="#install">下载安装</a> ·
  <a href="#build">源码构建</a> ·
  <a href="#upstream">与上游关系</a> ·
  <a href="#thanks">致谢</a> ·
  <a href="README.en.md">English</a>
</div>

<br>

> [!NOTE]
> **关于本仓库**：这是 [`marktext/marktext`](https://github.com/marktext/marktext) 的**独立维护分支**，不向上游提交 PR。原版功能完整保留，另叠加六项增强：**粘贴公式自动归一化**、**anydoc 全格式文档导入**、**导入图片自动落盘并放回原位**、**导入失败可见反馈**、**论文级公式兼容层**、**单反斜杠公式定界符默认开启**。若只需原版，请前往上游下载官方构建。

---

## 📑 目录

- [🎯 功能一览](#overview)
- [📝 写作与编辑](#editing)
- [🧩 Markdown 语法与扩展](#syntax)
- [📊 图表与可视化](#diagrams)
- [🖼️ 图片与媒体](#images)
- [🎨 主题与外观](#themes)
- [📤 导入与导出](#io)
- [🚀 本分支新增的六项能力](#fork-extras)
- [🖼️ 截图](#screenshot)
- [📥 下载与安装](#install)
- [🛠️ 从源码构建](#build)
- [🔗 与上游的关系](#upstream)
- [📜 开源许可](#license)
- [🙏 致谢原版](#thanks)

---

<a id="overview"></a>

## 🎯 功能一览

| 领域 | 你能做什么 |
| :--- | :--- |
| **写作与编辑** | 实时所见即所得预览、三种编辑模式、快速插入、行转换、表格工具、查找替换、文档统计、拼写检查 |
| **Markdown 语法** | CommonMark + GFM + Pandoc 扩展，数学公式、脚注、任务列表、表格、GitHub Alerts、Front Matter |
| **公式能力** | KaTeX 渲染、`$...$` / `$$...$$` / `\(...\)` / `\[...\]`、公式编号与交叉引用、`\newcommand` 宏、mhchem 化学式 |
| **图表与可视化** | Mermaid、PlantUML、Vega-Lite、flowchart、sequence，可放大、导出 SVG/PNG |
| **图片与媒体** | 剪贴板直接粘贴、图床上传、自动归集到相对资源目录、导入文档时自动提取内嵌图片 |
| **主题与外观** | 多套亮色/暗色主题、跟随系统、自定义主题、导出专用主题 |
| **导入与导出** | 导出 HTML / PDF / 打印及 pandoc 多格式；导入 Office、PDF、RTF、EPUB、CSV 等，并保留图片与结构 |
| **效率与工程** | 多标签页、目录树、阅读模式、快捷键体系、命令行启动、便携版、可编辑偏好文件 |
| **本分支增强** | 六项补丁：公式粘贴归一化、anydoc 导入、图片落盘、失败可见反馈、公式兼容层、单反斜杠默认开启 |

一句话概括：**输入即排版，公式即渲染，文档即导入。**

---

<a id="editing"></a>

## 📝 写作与编辑

- **实时所见即所得（WYSIWYG）**：输入 Markdown 语法后即时呈现排版效果，界面干净，专注写作不被打扰。
- **三种编辑模式**：**源代码模式**（直接编辑纯文本）、**打字机模式**（当前行始终居中）、**专注模式**（只高亮当前段落）；另有**阅读模式**与**预览标签页**。
- **快速插入**：新行输入 `/` 即唤出功能菜单，标题、列表、表格、代码块、图表一键插入。
- **行转换器**：把当前行一键转成其他块类型，并支持复制行、在块后插入段落、删除行。
- **表格工具**：`Ctrl/Cmd + Shift + T` 呼出表格对话框，自由设定行列数；后续可增删行列、移动单元格、设置对齐，单元格内仍可用行内格式。
- **查找与替换**、**标题与文档导航**：长文档可快速跳转。
- **文档统计**：标题栏实时显示字数、段落数、字符数、含空格字符数，以及文件创建/修改时间；有选区时同时显示选区与全文统计。
- **输入辅助**：括号与引号自动补全、链接自动识别、选区与删除操作增强。
- **拼写检查**：多语言词典、自定义词典、可隐藏拼写标记。
- **文件级控制**：文件编码、行尾换行符（LF/CRLF）可分别设置。
- **多文件工作区**：多标签页、单窗口打开多个目录、目录树中移动文件与文件夹。
- **效率设施**：完整的跨平台快捷键体系、命令行（CLI）启动与只读打开、便携版（Portable）支持；偏好设置可在图形界面调整，也可直接编辑 `preferences.json`。

---

<a id="syntax"></a>

## 🧩 Markdown 语法与扩展

| 规范 / 扩展 | 支持内容 |
| :--- | :--- |
| **CommonMark** | 标题、段落、换行、分隔线、强调、链接、图片、引用、列表、花式列表、代码块、原始 HTML、反斜杠转义 |
| **GitHub Flavored Markdown** | 删除线、任务列表（Todo List）、表格、扩展自动链接 |
| **Pandoc 扩展** | 脚注、上标与下标、**数学公式** |
| **其他约定** | GitHub Alerts（`> [!NOTE]` 等）、高亮 `==text==`、行内 diff、多行引用、键盘按键、Emoji 短码、Front Matter、命名锚点 |

- **数学公式**：由 KaTeX 渲染，行内 `$...$` 与块级 `$$...$$` 均支持；单反斜杠 `\(...\)` / `\[...\]` 也已默认开启，导出 HTML/PDF 时一并保留。
- **论文级公式**：支持 `align` / `gather` / `equation` 环境、`\ce{}` 化学式，以及 `\label` / `\ref` / `\eqref` 交叉引用、公式自动编号与 `\newcommand` 宏定义（详见 [能力 5](#fork-extras)）。
- **代码高亮**：围栏代码块标注语言（如 ` ```js `）即自动着色。
- **导出一致性**：HTML/PDF 渲染器会读取文档中的公式、脚注、上下标、高亮、行内 diff、多行引用与 GitHub Alerts 配置，折叠的标题仍会导出完整章节内容。

---

<a id="diagrams"></a>

## 📊 图表与可视化

在代码块围栏上标注语言即可渲染图表，支持 **Mermaid、PlantUML、Vega-Lite、flowchart、sequence** 五类。Mermaid 覆盖流程图、甘特图、时序图、类图等常用类型。

鼠标悬停已渲染的图表会出现工具栏：可放大查看，也可**另存为 SVG、另存为 PNG，或直接复制为图片**粘贴到聊天窗口与幻灯片，无需导出整篇文档。本地渲染的图表 PNG 导出使用编辑器背景色。

---

<a id="images"></a>

## 🖼️ 图片与媒体

- **剪贴板直接粘贴图片**，无需先保存文件。
- **图床上传**：可配置所选 uploader，插入时自动上传并替换为远程地址。
- **本地归集**：插入的本地图片可自动复制到指定目录，支持相对 `assets` 路径（`assets`、`../assets`、`assets/${filename}` 等变量），远程 URL 保持原样；未保存文档回退到全局目录。
- **导入文档的内嵌图片**：从 docx / pptx / odt 等导入时，图片会被提取到源文件同目录的 `assets/`，并尽量放回原文位置（详见 [能力 3](#fork-extras)）。
- **保留原位置**：也可选择不移动，仅引用原路径。
- **媒体查看器**：放大预览图表与图片。

---

<a id="themes"></a>

## 🎨 主题与外观

内置多套亮色与暗色主题（**Cadmium Light**、**Material Dark** 等），首次启动默认跟随系统主题；也可关闭跟随、在主题菜单中固定选择，或在偏好设置里分别指定亮/暗变体。支持**自定义主题**，以及独立于界面主题的**导出页面主题**。

---

<a id="io"></a>

## 📤 导入与导出

**导出**

- **HTML / PDF / 打印**：PDF 与打印可设置纸张尺寸、方向、页边距；HTML 可设置页面标题。
- **版式控制**：覆盖字体、字号、行高，标题自动编号，选择是否显示 Front Matter。
- **页眉页脚**：PDF 与打印支持无 / 单格 / 三格页眉，页眉按页重复，页脚固定于底部。
- **pandoc 多格式**：docx、odt、rtf、epub、latex、rst、org、mediawiki、textile。

**导入**（`文件 → 导入`）

| 走 anydoc（本分支新增） | 仍走 pandoc |
| :--- | :--- |
| doc / docx / docm | html |
| ppt / pptx / pps | latex / rst / org |
| xls / xlsx | wiki / opml / textile |
| odt / ods / odp | |
| rtf · epub · csv · **pdf** | |

anydoc 是 Rust 实现的文档解析器，转换时**保留表格、标题层级与文档结构**；以惰性方式加载，缺少平台二进制时自动回退到 pandoc，不会导致程序无法启动。

导入图文混排文档时，内嵌图片会一并提取到源文件旁的 `assets/` 目录并插回 Markdown；若文档含扫描页、被加密或格式不支持，界面会给出**可操作的失败提示**，而不是只在日志里留一行错误。导入成功时也会通知提取了多少张图片、多少张放回原位。

---

<a id="fork-extras"></a>

## 🚀 本分支新增的六项能力

前两项补齐「把内容请进来」，后四项补齐「进来之后能直接用」。

### 1. 粘贴时自动归一化 LaTeX 公式

从大模型对话、JSON 输出或日志里复制的公式，常因多转义一次而变成 `\\( ... \\)` / `\\[ ... \\]`，连下划线也写成 `\_`。MarkText 不把这些当作公式定界符，粘贴后只会显示一堆源码。

本分支在**粘贴瞬间**将其还原为标准 `$...$` 与 `$$...$$`，`Ctrl+V` 与「粘贴为纯文本」两条路径都覆盖；同时丢弃剪贴板中的 HTML 副本，避免原始定界符被重新贴回来。没有转义特征的内容不会被改动——矩阵里正常的 `\\` 换行、正文中转义的字面括号、围栏代码块与行内代码均保持原样。

```diff
- 设模型为 \\(f\_\theta\\)，其计算结构为 \\[ G_T=(V_T,E_T,W_T) \\]
+ 设模型为 $f_\theta$，其计算结构为
+ $$ G_T=(V_T,E_T,W_T) $$
```

### 2. 用 anydoc 导入 Office / PDF / RTF

原版导入仅覆盖 pandoc 能读的少数格式，PPT、Excel、PDF、RTF 完全无法导入，`.docx` 的表格也会被压平。本分支按扩展名分派给 anydoc，补齐了上述格式（详见 [导入与导出](#io)）。

### 3. 导入文档时连图片一起带进来

原先转换只取 Markdown 文本，内嵌图片全部丢弃，导入图文混排的设计书后只剩一句 alt 文本。现在会读取 anydoc 的文档模型（`toDocument()`），把每个图片资源写入**源文件同目录的 `assets/`**，按原文件名与资源编号命名；再依据图片在原文中的锚点，把 `![...](...)` 插回大致原位。找不到锚点的图片不会被静默丢弃，而是统一列在文末「**导入的图片**」小节。

导入完成的通知会说明：提取了几张、几张放回原位、几张附在末尾、落盘目录在哪。PDF 等没有文档模型的格式仍按纯文本正常导入，不会因此失败。

### 4. 导入失败不再无声无息

扫描版 PDF 触发 `needsOcr`、文档被加密、格式不受支持、结构损坏、超出安全限制、文件不可读等情况，过去只在日志里报错，界面毫无反应。现在按 anydoc 返回的错误码给出**分类提示与处理建议**，例如「该 PDF 含扫描页，anydoc 不做 OCR，请先对这几页做 OCR」，并明确告知可换用其他转换工具。提示覆盖 13 种界面语言。

### 5. 论文级公式兼容层（不换渲染引擎）

KaTeX 逐条公式渲染，天生不认识 LaTeX 的文档级概念。本分支在公式送入 KaTeX 之前做一层等价改写，而不是把引擎换成 MathJax（后者会拖慢实时渲染，且已内联在渲染包里）：

| 写法 | 处理方式 |
| :--- | :--- |
| `\label{}` / `\ref{}` / `\eqref{}` | 建立全文档编号映射，改写为 `\tag` 与字面编号；引用尚未定义时显示 `??`，下一次渲染自动补上（与 LaTeX 两遍编译行为一致） |
| `\newcommand` / `\renewcommand` / `\providecommand` / `\def` | 提取为 KaTeX `macros`，支持嵌套花括号的宏体 |
| `\tag{}` | 保留自定义编号，不占用自动计数 |
| `\nonumber` / `\notag` / `\numberwithin` / `\allowdisplaybreaks` | 文档级命令在单条公式中无意义，予以清理 |

编号状态按文档隔离：新建或替换文档时重置，不会串到另一篇。块级公式默认只给带 `\label` 的编号，也预留了「全部编号」开关。`align` / `gather` / `equation` 环境与 `\ce{}` 化学式本就是 KaTeX + mhchem 原生支持，不做多余改写。

### 6. 单反斜杠公式定界符默认开启

`texMathSingleBackslash` 开关原版就有，但默认关闭，导致从 LaTeX、论文源码和聊天工具里带来的 `\(...\)` / `\[...\]` 一律显示为源码。本分支把默认值改为**开启**，并对已有 `preferences.json` 做**一次性迁移**（写迁移标记，之后用户手动关闭的选择不会被反复覆盖）；偏好面板对应项在 13 种语言中标注为「推荐」。

> 六项增强均以可审阅的小补丁形式维护，改动集中在 `packages/muya/src/clipboard/`、`packages/muya/src/utils/katexCompat.ts`、`packages/desktop/src/main/utils/anydoc.ts` 与 `packages/desktop/src/main/menu/actions/file.ts`，并配有单元测试。

---

<a id="screenshot"></a>

## 🖼️ 截图

![MarkText 界面](https://raw.githubusercontent.com/jeokeo011222/marktext/develop/docs/assets/marktext.png?raw=true)

---

<a id="install"></a>

## 📥 下载与安装

本分支的增强**尚未发布官方安装包**，有两种使用方式：

1. **使用上游官方构建**（稳定、已签名，但不含本分支增强）：<https://github.com/marktext/marktext/releases/latest>
2. **从源码构建本分支**以获得全部六项增强，见下节；本分支的发布页见 <https://github.com/jeokeo011222/marktext/releases>。

系统要求：**Windows 10/11**、**macOS 13+** 或现代 Linux 发行版；x64 与 arm64 均可。

---

<a id="build"></a>

## 🛠️ 从源码构建

项目为 pnpm workspace，以下命令均在仓库根目录执行：

```bash
pnpm install                 # 安装依赖（下载 Electron、重建原生模块）
pnpm run dev                 # 开发模式启动，渲染进程热更新
pnpm run build:unpack        # 只编译不打包，快速验证主/渲染进程
pnpm run build:win           # Windows 安装包（NSIS + zip）
pnpm run build:mac           # macOS（DMG + zip）
pnpm run build:linux         # Linux（AppImage、snap、deb、rpm、tar.gz）
```

检查与测试：

```bash
pnpm run test          # 桌面端单元测试（Vitest）
pnpm run test:e2e      # 端到端测试（Playwright）
pnpm run lint          # ESLint
pnpm run typecheck     # vue-tsc --noEmit
```

> ⚠️ Windows 上 `ced`、`native-keymap` 等原生模块需 node-gyp 编译，依赖 **VS 2022 及以上 C++ 生成工具**。若安装时跳过了原生编译，补跑 `pnpm rebuild` 即可。anydoc 为平台原生模块，打包时需保持 `asarUnpack` 配置。

---

<a id="upstream"></a>

## 🔗 与上游的关系

- 本仓库 fork 自 [`marktext/marktext`](https://github.com/marktext/marktext)，以其 `develop` 分支为基线。
- **独立维护，不向上游提交 PR**；上游的功能更新由我们自行合并。
- 六项增强以可审阅的小补丁叠加在基线之上，跟进上游时可重放：

  ```bash
  git remote add upstream https://github.com/marktext/marktext.git
  git fetch upstream
  git rebase upstream/develop
  ```

---

<a id="license"></a>

## 📜 开源许可

延续上游的 **MIT License**，保留原项目版权声明。详见 [LICENSE](LICENSE)。

---

<a id="thanks"></a>

## 🙏 致谢原版

本项目的几乎全部能力，都来自 **[marktext/marktext](https://github.com/marktext/marktext)**。

衷心感谢作者 [**Jocs**](https://github.com/Jocs) 与 [所有贡献者](https://github.com/marktext/marktext/graphs/contributors)，以及多年来维护 Muya 编辑器引擎、界面、主题体系、多语言文档与跨平台构建链的社区成员。上面列出的每一项功能——实时预览、CommonMark/GFM 兼容、KaTeX 公式、五类图表、表格工具、图片工作流、主题与导出——都是原版已经做好的工作，本分支只是沿用并如实记录。

也一并感谢 **KaTeX、Mermaid、PlantUML、Vega-Lite、pandoc、anydoc、Electron、Vue** 等上游开源项目，以及为 MarkText 提供[赞助](https://github.com/sponsors/marktext)的个人与机构。

本分支所做的，不过是在这座已经建得很完整的房子里补了几处细节：把粘贴来的公式摆正、把 Office / PDF 文档连图带表请进门、让论文里的编号与引用能显示出来，并在出错时给一句明确的提示。**所有功劳归于原版作者与社区；本分支若有任何问题，责任在我们。**

| | |
| :--- | :--- |
| 本分支 · 功能说明（README） | <https://github.com/jeokeo011222/marktext#readme> |
| 本分支 · 源码与下载 | <https://github.com/jeokeo011222/marktext/releases> |
| 本分支 · 问题反馈 | <https://github.com/jeokeo011222/marktext/issues> |
| 原版仓库 | <https://github.com/marktext/marktext> |
| 官方网站 | <https://marktext.me> |
| 用户文档 | <https://marktext.me/docs/introduction> |
| 支持原版 | <https://github.com/sponsors/marktext> |

如果 MarkText 让你的写作更顺手，请优先考虑支持原版项目。❤️
