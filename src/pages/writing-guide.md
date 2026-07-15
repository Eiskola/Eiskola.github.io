---
title: 写作指南
published: 2026-07-15
description: Alpha 博客文章支持的 Markdown 功能、写作规范与 frontmatter 编写要求。
category: Meta
draft: false
---

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
| `title` | ✓ | 文章标题 |
| `published` | ✓ | 发布日期，格式 `YYYY-MM-DD` |
| `description` | | 文章摘要。用于 SEO 元标签（`<meta description>`）、Open Graph 预览卡片、RSS 摘要。**不直接显示在页面上** |
| `updated` | | 最后修改日期。设置后会在页面 date 旁边显示斜体 "updated xxxx" |
| `tags` | | 标签数组，用于分类检索和相关文章推荐 |
| `category` | | 一级分类，一个文章只能属于一个分类 |
| `draft` | | 设为 `true` 则文章不会出现在任何列表和 RSS 中 |

> 注意：`updated` 建议在内容有实质性修订时更新，小修改不必改。

## Markdown 支持

### 代码块

使用常规的三反引号围栏代码块，支持语言标注：

````
```cpp
auto matcher = clang::ast_matchers::functionDecl().bind("fn");
```
````

Expressive Code 会自动语法高亮、显示行号和语言徽章。支持折叠长代码块。

### 行内数学公式

使用 KaTeX，`$...$` 行内公式，`$$...$$` 块级公式：

```latex
行内：$\mathbf{A} \in \mathbb{R}^{m \times n}$

块级：
$$
\sum_{i=1}^{n} \lambda_i \mathbf{v}_i = \mathbf{0}
$$
```

### Admonition 提示块

使用 remark-directive 语法，支持五种类型：

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

### Wiki 链接

使用 `[[...]]` 语法引用站内其他文章，路径相对于 `src/content/posts/`：

```markdown
详见 [[LLVM/Cores/write_a_pass]] 中的说明。
```

### 脚注

在正文中使用 `[^标识符]` 添加脚注引用，在文末用 `[^标识符]:` 定义脚注内容：

```markdown
Clang Tooling 的核心抽象是 FrontendAction[^1] 和 ASTConsumer[^consumer]。

[^1]: FrontendAction 定义了在编译各阶段触发的回调接口。
[^consumer]: ASTConsumer 是 Clang AST 的入口点，通过 `HandleTranslationUnit()` 方法接收完整 AST。
```

脚注内容会自动排布在文章底部，并以 `↩` 链接回到引用位置。

### 图片与标注

```markdown
![图片描述](path/to/image.png)
```

图片支持点击放大灯箱功能。rehype 插件会自动为带 title 的图片添加 caption。

### 表格

标准 Markdown 表格，移动端可横向滚动。

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

### 图片存放

文章图片放在文章同级目录下的 `images/` 子目录中，通过相对路径引用：

```markdown
![架构图](images/architecture.png)
```
