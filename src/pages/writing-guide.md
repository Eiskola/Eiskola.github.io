---
layout: ../layouts/MarkdownLayout.astro
title: 写作指南
published: 2026-07-15
description: Alpha 博客文章支持的 Markdown/GFM 语法、代码块增强、扩展插件、frontmatter 编写要求与内容组织规范。
category: Meta
draft: false
---

本指南列出当前博客实际启用的全部写作功能。除了标准 Markdown，本站还启用了 GFM、KaTeX、Expressive Code 代码块增强，以及提示块、Wiki 链接、脚注、图片图注等自定义扩展。

## Frontmatter

每篇文章开头需要 YAML 格式的元数据，样例：

```yaml
---
title: LibTooling架构解析（一）：从 ClangTool 到 CompileInstance
published: 2026-02-21
updated: 2026-03-01
description: 深入剖析 LibTooling 核心架构与各组件协作机制。
tags: [LLVM, Clang, LibTooling]
category: LLVM
draft: false
---
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | ✓ | 文章标题。同时用于页面标题、文章列表和 RSS |
| `published` | ✓ | 发布日期，格式 `YYYY-MM-DD` |
| `description` | | 文章摘要。用于 SEO 元标签（`<meta description>`）、Open Graph 预览卡片、RSS 摘要。**不直接显示在页面上** |
| `updated` | | 最后修改日期。设置后会在页面 date 旁边显示斜体 "updated xxxx" |
| `tags` | | 标签数组，用于标签页和相关文章推荐 |
| `category` | | 一级分类，一篇文章只能属于一个分类 |
| `draft` | | 设为 `true` 则文章不会生成页面，也不会出现在列表、RSS、搜索索引和站点地图中 |

> 注意：`updated` 建议在内容有实质性修订时更新，小修改不必改。

`src/pages/` 下的独立 Markdown 页面（例如 `about.md` 和本页）需要在 frontmatter 中声明布局；`src/content/posts/` 下的文章由文章模板统一渲染，不需要该字段：

```yaml
layout: ../layouts/MarkdownLayout.astro
```

独立页面只使用 `MarkdownLayout`，不会显示右侧目录、阅读时间、相关文章和评论区；这些是文章模板自动生成的功能。

文章正文不要再写一级标题：文章模板会使用 `title` 渲染页面 `<h1>`，正文从 `##` 开始即可。

## 基础 Markdown 与 GFM

站点启用了 GFM（`remark-gfm`）和 smartypants，以下语法可以直接使用：

| 功能 | 写法 |
|---|---|
| 标题 | `## 二级标题`、`### 三级标题`，最多到 `######` |
| 粗体 / 斜体 | `**粗体**`、`*斜体*` |
| 删除线 | `~~删除线~~` |
| 行内代码 | 用一对反引号包裹，例如 `code` |
| 链接 | `[链接文字](https://example.com)` |
| 自动链接 | `<https://example.com>` |
| 引用 | `> 引用内容` |
| 无序列表 | `- 项目` 或 `* 项目` |
| 有序列表 | `1. 项目` |
| 任务列表 | `- [ ] 未完成`、`- [x] 已完成` |
| 分隔线 | `---` |
| 表格 | 标准 GFM 表格，支持对齐 |
| 原生 HTML | 直接嵌入 `<kbd>`、`<details>` 等标签 |
| 转义 | `\*`、`\_`、`\$` 等 |

标题会自动生成锚点 id，并出现在文章页右侧目录中；目录默认提取 `h1` 到 `h3`（可在 `src/config.ts` 的 `tocConfig` 中调整）。鼠标悬停在标题上会显示 `#` 锚点，点击即可跳转到该小节。

站点启用了 smartypants，正文中的直引号、`--`、`...` 会被转换为弯引号、破折号和省略号；代码块与行内代码中的字符不受影响。

### 表格

标准 GFM 表格，支持左/中/右对齐：

```markdown
| 左对齐 | 居中 | 右对齐 |
| :--- | :---: | ---: |
| a | b | c |
```

移动端表格会横向滚动，不会撑破正文宽度。

## 代码块

### 基础用法

使用三反引号围栏代码块，并标注语言：

````markdown
```cpp
auto matcher = clang::ast_matchers::functionDecl().bind("fn");
```
````

Expressive Code 会自动完成：

- Shiki 语法高亮（主题为 `github-light`，深色模式会自动适配）
- 行号显示（默认开启；`bash`、`sh`、`shellsession` 默认关闭）
- 右上角复制按钮（终端框架复制时会自动去掉 `#` 开头的注释行）
- 无标题且非终端框架时，右上角显示语言徽章（悬停时隐藏）
- 自动换行（默认开启，可关闭）

### 代码块选项

选项写在语言标识之后，用空格分隔；值中如果有空格，需要用引号包起来：

| 选项 | 说明 | 示例 |
|---|---|---|
| `title` | 显示文件名或标题 | `title="src/main.cpp"` |
| `frame` | 框架样式：`auto`、`code`、`terminal`、`none` | `frame="terminal"` |
| `showLineNumbers` | 是否显示行号 | `showLineNumbers=false` |
| `startLineNumber` | 起始行号 | `startLineNumber=10` |
| `wrap` | 是否自动换行 | `wrap=false` |
| `preserveIndent` | 自动换行时保留原缩进 | `preserveIndent=false` |
| `hangingIndent` | 折行部分的额外缩进列数 | `hangingIndent=2` |
| `collapse` | 折叠指定行范围 | `collapse={5-12}` |
| `collapseStyle` | 折叠样式 | `collapseStyle="collapsible-start"` |

组合示例：

````markdown
```cpp title="src/main.cpp" frame="code" showLineNumbers=true startLineNumber=1 wrap=true
int main() {
  return 0;
}
```
````

- `frame="auto"` 是默认值：终端语言使用终端框架，其余语言使用编辑器框架。
- `frame="code"` 强制使用编辑器框架。
- `frame="terminal"` 强制显示终端窗口样式；`bash`、`sh`、`console`、`zsh` 等终端语言会自动使用终端框架，也可以手动指定。
- `frame="none"` 去掉外框，适合非常短的代码片段。
- `wrap=false` 会关闭自动换行，超长行改为横向滚动。
- `preserveIndent=false` 会让折行部分从第一列开始；`hangingIndent` 可以给折行部分增加额外缩进。

代码块前 4 行中如果有一行是文件名注释，Expressive Code 会自动把它提取为标题，并从代码中移除该行。例如：

````markdown
```cpp
// src/main.cpp
int main() {
  return 0;
}
```
````

会显示标题 `src/main.cpp`，代码从 `int main()` 开始。支持 `//`、`#`、`<!-- -->` 和 `/* */` 形式的注释。

### 文字高亮与行标记

Expressive Code 支持三种文字标记，分别对应黄色高亮、绿色插入和红色删除：

| 类型 | 效果 | 行标记写法 | 文字标记写法 |
|---|---|---|---|
| `mark` | 黄色高亮 | `mark={2-3}` | `mark="TODO"` |
| `ins` | 绿色插入 | `ins={5}` | `ins="newValue"` |
| `del` | 红色删除 | `del={7}` | `del="oldValue"` |

行标记示例：

````markdown
```cpp mark={2-3} ins={5} del={7}
int a = 1;
int b = 2;
int c = 3;
int d = 4;
int e = 5;
int f = 6;
int g = 7;
```
````

- 标记范围从代码块内的第一行开始计算，与 `startLineNumber` 无关。
- 多个范围用逗号分隔，例如 `mark={1,3-5}`；也可以重复写多个同名选项。
- 文字标记会匹配该行中所有出现位置，并用 `<mark>`、`<ins>`、`<del>` 内联标出。字符串和正则都支持，例如 `mark=/TODO|FIXME/`。
- 行标记可以带自定义标签，标签显示在左侧行号槽中：

````markdown
```cpp mark={"重点":2-3}
int a = 1;
int b = 2;
int c = 3;
```
````

`ins` 和 `del` 同样支持 `{"标签":行范围}` 写法。标记颜色由 `astro.config.ts` 中的 `styleOverrides.textMarkers` 控制；深色模式下代码区会整体反色适配。

### Diff 代码块

使用 `diff` 语言并保留 `+`/`-` 前缀即可显示增删行：

````markdown
```diff lang="cpp"
- int x = 1;
+ int x = 2;
  int y = 3;
```
````

`+` 行显示为绿色插入，`-` 行显示为红色删除，未标记的行保持普通样式。`lang="cpp"` 会让 Expressive Code 继续使用 C++ 语法高亮，而不是按纯 diff 文本处理。

如果不想把语言写成 `diff`，也可以给任意语言加上 `useDiffSyntax`：

````markdown
```cpp useDiffSyntax
+ int added = 1;
- int removed = 2;
  int same = 3;
```
````

`+`/`-` 后需要一个空格；代码块的公共缩进会被自动移除。

### 折叠长代码

使用 `collapse` 折叠指定行范围（按代码块内行号，从 1 开始）：

````markdown
```cpp collapse={5-12}
// 第 1 行
// 第 2 行
// 第 3 行
// 第 4 行
// 第 5 行
// ... 被折叠
// 第 12 行
```
````

默认的 `github` 样式只显示一行 `N collapsed lines` 摘要，展开后不能再次折叠。若需要反复展开/折叠，可以指定：

- `collapseStyle="collapsible-start"`：折叠摘要保留在代码上方
- `collapseStyle="collapsible-end"`：折叠摘要保留在代码下方
- `collapseStyle="collapsible-auto"`：根据折叠区域位置自动选择

多个折叠范围用逗号分隔，例如 `collapse={2-4,8-10}`。折叠摘要默认会按代码的最小缩进对齐，设置 `collapsePreserveIndent=false` 可以关闭这一行为。

### 富文本伪代码（pcode）

`pcode` 用于伪代码、算法和需要数学记号但普通 `text` 代码块无法表达的文本。它保留 Expressive Code 的框架、行号、`mark`、折叠和复制按钮，同时把 `$...$` 中的内容交给 KaTeX 渲染：

````markdown
```pcode title="Algorithm 1　SymbReachRefine" frame="code" mark={4}
create root $r$ labeled with $r_0$
while there are unmarked nodes do
    let $w$ be a region with $w \equiv r$ and $w \sqsubseteq r$
    relabel $m$ by $\widehat{\mathrm{post}}(w, \sigma_m)$
return the region $\bigcup\{u \mid m{:}u \text{ is an uncovered marked node}\}$
```
````

- 普通西文使用 Times New Roman，中文使用正文的宋体；`$...$` 中的公式使用 KaTeX 字体。下标、帽子、集合运算符等不再依赖系统字体是否齐全。
- 数学部分使用 LaTeX 语法，例如 `\sigma_m`、`\sqsubseteq`、`\bigcup`、`\widehat{\mathrm{post}}`。
- `title`、`frame`、`mark`、`showLineNumbers`、`wrap` 等代码块选项仍然可用。
- 需要显示美元符号本身时使用 `\$`；`pcode` 按纯文本处理，不启用语法高亮。
- 复制按钮复制的是包含 `$...$` 的原始文本，方便继续编辑。

## 页面锚点与交叉引用

可以给页面元素添加锚点，然后在正文中写可点击的交叉引用。代码块直接在围栏信息里加 `id`，可选的 `label` 用作默认引用文字：

````markdown
```pcode title="Algorithm 1　SymbReachRefine" id="algo-1" label="Algorithm 1"
...
```
````

其他元素（图片、表格、标题、段落等）用 `::anchor` 叶子指令，标记放在目标元素前面，单独占一行：

````markdown
::anchor[图 8]{#fig-8}

![图 8　局部精化示意图](images/example.png)
````

`{#fig-8}` 中的 ID 是**作者自定义**的，不会根据标题自动生成，也不会自动编号：

| 部分 | 含义 |
| :--- | :--- |
| `::anchor` | 指令名 |
| `[图 8]` | 默认引用文字，可省略 |
| `{#fig-8}` | 自定义锚点 ID；`#` 表示这是 `id` 属性，`fig-8` 是名字 |
| `[[#fig-8]]` | 按这个 ID 引用目标 |

ID 的命名规则：

- `{#id}` 不能省略，引用需要一个稳定的键。
- 同一页面内必须**唯一**，并且区分大小写；`[[#fig-8]]` 必须和定义时的 ID 完全一致。
- 建议只用小写字母、数字、`-` 和 `_`，并以字母开头，例如 `sec-5-4`、`algo-1`、`fig-8`、`theorem-2`。
- `{#id}` 简写里的 `.` 会被解析成 class 分隔符，所以 ID 不要带点号。需要点号时改用显式属性写法：
  ```markdown
  ::anchor[区域定义]{id="para-4.1-AreaDefination"}
  ```
- 不要包含空格、引号、`#`、`/`；不要写成 `{##fig-8}`。
- 方括号里的文字只是默认显示文字；改它不会影响 ID 或已有引用，但改 ID 时必须同步修改所有 `[[#...]]`。
- 代码块里的 `id="algo-1"` 遵循同样的规则；`label="Algorithm 1"` 只是默认显示文字。

引用写法：

```markdown
[[#algo-1]]              默认显示 Algorithm 1
[[#algo-1|Algorithm 1]]  自定义显示文字
[[#fig-8|图 8]]           引用图片
```

- 代码块默认引用文字取 `label`，没有 `label` 时取 `title`；锚点指令默认取方括号里的文字。
- 引用会渲染成普通的页内链接，点击直接跳转，不提供脚注那样的悬浮预览。
- 锚点 ID 在同一页面内应保持唯一，建议只使用字母、数字、`-`、`_`、`.` 和 `:`。
- `::anchor` 前后的空行都不是语法要求；保留空行只是为了可读性。`::anchor` 本身是块级 leaf directive，下一行会正常成为独立元素。
- 标题也可以使用这种方式，例如在 `### 5.4 论文算法原文` 前放 `::anchor[§5.4]{#sec-5-4}`，正文写 `[[#sec-5-4|§5.4]]`。

## 数学公式

使用 KaTeX 渲染。`$...$` 是行内公式，`$$...$$` 是块级公式：

```latex
行内：$\mathbf{A} \in \mathbb{R}^{m \times n}$

块级：
$$
\sum_{i=1}^{n} \lambda_i \mathbf{v}_i = \mathbf{0}
$$
```

块级公式建议单独成段，移动端可以横向滚动。需要显示美元符号本身时使用 `\$` 转义。

## 提示块（Admonition）

使用 remark-directive 容器语法，支持五种类型：

```markdown
:::note
这是普通注释。
:::

:::tip
这是技巧提示。
:::

:::important
这是重要说明。
:::

:::caution
这是注意事项。
:::

:::warning
这是警告信息。
:::

:::note[自定义标题]
带自定义标题的注释块。
:::
```

省略方括号时显示类型名的大写形式（`NOTE`、`TIP`、`IMPORTANT`、`CAUTION`、`WARNING`）；`[自定义标题]` 可以覆盖默认标题，标题内也支持行内格式。提示块类型名请使用小写，块内部可以继续使用列表、代码块、公式、链接等 Markdown。

渲染效果：

:::note[自定义标题]
提示块内可以包含 **粗体**、`行内代码`、列表和代码块。
:::

## Wiki 链接

使用 `[[...]]` 语法引用站内其他文章，路径相对于 `src/content/posts/`，不需要写 `.md` 扩展名：

```markdown
详见 [[LLVM/Cores/write_a_pass]] 中的说明。
```

支持自定义显示文字：

```markdown
详见 [[LLVM/Cores/write_a_pass|如何编写 Pass]]。
```

如果文件名在站内唯一，也可以省略目录：

```markdown
参见 [[write_a_pass]]。
```

链接目标不存在时，原文会保持为普通文本，不会生成链接。建议优先写完整路径，避免文件名重复导致歧义。代码块和行内代码中的 `[[...]]` 不会被解析。

## 脚注

在正文中使用 `[^标识符]` 添加脚注引用，在文末或其他位置用 `[^标识符]:` 定义内容：

```markdown
Clang Tooling 的核心抽象是 FrontendAction[^1] 和 ASTConsumer[^consumer]。

[^1]: FrontendAction 定义了在编译各阶段触发的回调接口。
[^consumer]: ASTConsumer 是 Clang AST 的入口点，通过 `HandleTranslationUnit()` 方法接收完整 AST。
```

脚注定义可以出现在文章任意位置，渲染时会统一排布在文章底部；点击 `↩` 可以回到引用位置。标识符可以使用数字或单词，但不能包含 `]`。

## 图片与图注

```markdown
![图片描述](path/to/image.png)
```

- 图片单独成段时，`alt` 文本会自动作为图注显示在图片下方。
- `alt` 同时用于无障碍描述和图片加载失败时的替代文本，务必填写。
- 点击图片可以打开灯箱查看大图；点击背景、关闭按钮或按 `Esc` 退出。
- 图注取自 `alt`，不是 Markdown 图片的 `title`。

本地图片建议放在文章同级目录下的 `images/` 子目录中，通过相对路径引用：

```markdown
![架构图](images/architecture.png)
```

Astro 会在构建时处理本地图片并生成优化后的资源；远程图片也可以直接使用 URL。

## 目录、锚点与自动生成内容

以下内容由文章模板自动生成，不需要在 Markdown 中手动维护：

| 功能 | 说明 |
|---|---|
| 右侧目录 | 文章页自动提取 `h1`–`h3`，可通过 `src/config.ts` 的 `tocConfig` 调整范围 |
| 标题锚点 | 文章页标题自动生成 id；悬停显示 `#`，点击跳转到对应小节 |
| 阅读时间 | 按正文去空白字符数除以 400 估算（最少 1 分钟），显示在发布日期旁 |
| 上一篇 / 下一篇 | 按 `published` 日期排序自动生成 |
| 相关文章 | 按共享 `tags` 数量选取最多 3 篇 |
| 评论 | 文章底部自动加载 Giscus，按页面路径关联讨论 |
| 搜索 | 构建时通过 Pagefind 生成全文索引 |
| RSS | `/rss.xml` 自动生成，`description` 作为摘要，草稿会被排除 |
| 站点地图 | 构建时通过 sitemap 集成自动生成 |

## 内容组织

### 目录结构

文章按主题分目录存放于 `src/content/posts/`：

```
src/content/posts/
├── LLVM/
│   ├── clang/LibTooling1.md
│   ├── Cores/write_a_pass.md
│   └── Tools/vscode+clangd.md
├── PPA/1-数据流分析/
│   └── 1.0-数据流分析.md
├── AEM/1-矩阵分析/
│   └── ...
└── PL/C_Cpp/Templates/CRTP.md
```

文章路径即页面 URL：`/posts/llvm/cores/write_a_pass/`

站点会按 Astro 的 glob loader 规则生成 slug：字母转为小写，中文、数字、下划线和连字符保留，点号、加号等特殊字符会被移除，空格会转为连字符。为避免链接失效，文件名建议只使用小写字母、数字、`-`、`_` 和中文，不要使用 `#`、`?`、`%` 等 URL 特殊字符。

### 图片存放

文章图片放在文章同级目录下的 `images/` 子目录中，通过相对路径引用：

```markdown
![架构图](images/architecture.png)
```

### 草稿与发布

将 frontmatter 中的 `draft` 设为 `true` 后，文章不会生成页面，也不会出现在首页、归档、分类/标签页、RSS、搜索索引和站点地图中。发布前改为 `false` 或删除该字段即可（默认为 `false`）。

## 完整示例

````markdown
---
title: 一个完整的示例
published: 2026-11-13
description: 展示本站常用写作功能的组合方式。
tags: [LLVM, Clang]
category: LLVM
draft: false
---

## 背景

这里是一段普通正文，可以包含 **粗体**、*斜体*、`行内代码` 和 [外部链接](https://llvm.org)。

:::tip[提示]
提示块内可以放列表、公式和代码。
:::

## 代码

```cpp title="src/main.cpp" mark={2} ins={3}
int main() {
  int value = 1;
  return value;
}
```

## 公式

行内公式：$E = mc^2$。

$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$

## 参考

更多内容见 [[LLVM/Cores/write_a_pass]]。[^1]

[^1]: 这是一条脚注。
````
