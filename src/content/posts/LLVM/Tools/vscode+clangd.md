---
title: using clangd, instead of intellisense
published: 2025-10-01
description: how to use clangd in vscode
image: ./images/vscode+clangd/cover.png
tags: [tools, clangd, llvm]
category: LLVM
draft: false
---

## what is clangd?
&emsp;&emsp;如果你使用 llvm/clang 工具链开发 C/C++ 项目，那么对 **clangd** 应该不会陌生。这里不对 llvm/clang 工具链做过多介绍，但是 clangd 值得一提。

&emsp;&emsp;clangd 作为 llvm/clang 生态下的核心工具之一，主要用于为 C/C++ 提供语言服务器协议（LSP，language Server Protocol）支持，如代码补全、语法检查、代码导航或跳转等功能。clangd 通过解析代码结构，理解代码语义，提供更智能的代码分析和建议。

## why clangd?
&emsp;&emsp;有过 clion 和 vscode 开发 C/C++ 经验的同学应该有所感触，当从 clion 切换到 vscode 进行开发时，往往会觉得 vscode 的代码补全、语法检查等功能不如 clion 智能。vscode 默认使用的 **intellisense** 特别是在针对较大项目代码的分析上，不够精确、高效，有时甚至会出现误报的情况，而基于 clangd 的 clion 却能够带来更好的体验。那 vscode+intellisense 只能是唯一选择了吗？

&emsp;&emsp;实际上，llvm 团队开发了 clangd 插件供vscode环境使用，但为什么不禁用 intellisense，转而拥抱 clangd 呢？我想 clangd 无法做到开箱即用成为这唯一的阻碍。本文将介绍如何在 vscode 中使用 clangd。

![clangd plugin](./images/vscode+clangd/image1.png)

## how to use clangd in vscode?
&emsp;&emsp;下面介绍如何在 vscode 中配置并使用 clangd。

### 1. 安装 clangd
&emsp;&emsp;clangd 的安装方式多样，可以通过包管理器安装，也可以从 llvm 官网下载预编译的二进制文件，或从源码编译安装。

#### 源码编译安装
&emsp;&emsp;如果你尚未安装 llvm/clang 工具链，而有心尝试，推荐从源码直接编译安装clangd，这样可以获取**严格匹配的版本**。以下是简要步骤：
```bash
# 假设已经克隆好llvm项目源码（这里以20.1.5版本为例）
cd llvm-project
# 创建编译目录
mkdir build && cd build

# 配置 Cmake，指定安装路径（如 /usr/local/bin/llvm-20.1.5）
cmake -G "Unix Makefiles" \
  -DCMAKE_INSTALL_PREFIX=/usr/local/llvm-20.1.5 \
  -DLLVM_ENABLE_PROJECTS="clang;clang-tools-extra" \  # 包含clangd
  -DCMAKE_BUILD_TYPE=Release \
  ../llvm

#编译并安装
make -j$(nproc) # 根据情况调整并行数
sudo make install

# 添加到环境变量（~/.bashrc或~/.zshrc）
echo 'export PATH=/usr/local/llvm-20.1.5/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```
:::tip
如果只需要源码安装 clangd（即先前编码编译安装过 llvm/clang 其他工具链），可以在 `make -j$(nproc)` 时指定 `clangd` 目标即可，如 `make clangd -j$(nproc)`
:::

#### 通过包管理器安装
&emsp;&emsp;如果已经安装了 llvm/clang 工具链，但编译时并没有包含 clangd，可以通过包管理器按照，但是要安装与 llvm/clang 相匹配的版本。以下是简要步骤：
```bash
sudo apt update
sudo apt install clangd-20 # 以20版本为例

# apt 默认安装到 /usr/bin/clangd-20的位置
# 可以创建软连接到 llvm/clang 工具链目录下
sudo ln -s /usr/bin/clangd-20 /usr/local/llvm-20.1.5/bin/clangd
```

#### 验证安装
&emsp;&emsp;安装完成后，可以通过下面命令验证是否安装成功：
```bash
clangd --version
```
如果显示版本信息则说明安装成功。

### 2. vscode 插件配置
#### 安装 clangd 插件
&emsp;&emsp;打开 vscode 插件市场，键入 clangd 安装即可。

#### 禁用默认的 C++ 插件（避免冲突）
&emsp;&emsp;vscode 默认安装的 C++ 插件（ms-vscode.cpptools）会与 clangd 插件冲突，建议禁用该插件。可以在插件视图中找到该插件，点击禁用即可。

### 3. vscode 配置
&emsp;&emsp;需要修改 setting.json（全局或工作区），指定 clangd 行为。核心配置如下：
```json
{
    // ... 原有配置项

    // 禁用默认C++插件的IntelliSense
    "C_Cpp.intelliSenseEngine": "disabled",

    // clangd配置
    "clangd.arguments": [
      "--compile-commands-dir=${workspaceFolder}/build",  // 编译数据库路径（关键）
      "--background-index",                               // 后台索引，提升性能
      "--header-insertion=never",                         // 禁用自动插入头文件
      "--query-driver=/usr/local/llvm-20.1.5/bin/clang++", // 你的编译器路径
      "--all-scopes-completion",                          // 显示所有作用域的补全（可选）
      "--completion-style=detailed",                      // 补全信息更详细（可选）
      "--log=verbose"                                     // 调试日志（可选）
    ],

    // 用clangd格式化代码（可选）
    "editor.defaultFormatter": "llvm-vs-code-extensions.vscode-clangd",
    "[cpp]": { "editor.formatOnSave": true },
    "[c]": { "editor.formatOnSave": true }
}
```

### 4. 生成编译数据库
&emsp;&emsp;clangd 依赖**编译数据库**（Compilation Database）来理解项目的编译选项和结构。通常，编译数据库以 **compile_commands.json** 文件的形式存在，其本质是项目编译信息的结构化记录，告诉 clangd 如何解析项目中的每一个源文件。

&emsp;&emsp;compile_commands.json 是一个 JSON 数组，每个元素对应一个源文件的编译信息，核心字段包括：

- **directory**：编译该文件时的工作目录（绝对路径）；
- **command**：编译该文件的完整命令（包含所有的编译选项）；
- **file**：源文件的路径（绝对路径或相对于 directory 的相对路径）。

&emsp;&emsp;例如：

```json "directory" "command" "file"
[
  {
    "directory": "/home/user/my_project/build",
    "command": "g++ -I../include -I../third_party/spdlog/include -DDEBUG -std=c++17 -Wall -c ../src/main.cpp -o src/main.o",
    "file": "/home/user/my_project/src/main.cpp"
  },
  {
    "directory": "/home/user/my_project/build",
    "command": "g++ -I../include -I../third_party/json/include -DNDEBUG -std=c++17 -c ../src/util/string_utils.cpp -o src/util/string_utils.o",
    "file": "/home/user/my_project/src/util/string_utils.cpp"
  },
  {
    "directory": "/home/user/my_project/build",
    "command": "gcc -I../include -DPLATFORM_LINUX -std=c99 -Wextra -c ../src/core/config.c -o src/core/config.o",
    "file": "/home/user/my_project/src/core/config.c"
  },
  {
    "directory": "/home/user/my_project/build",
    "command": "g++ -I../include -I../third_party/protobuf/include -DUSE_PROTOBUF -std=c++20 -c ../src/net/network.cpp -o src/net/network.o",
    "file": "/home/user/my_project/src/net/network.cpp"
  },
  {
    "directory": "/home/user/my_project/build",
    "command": "g++ -I../include -DTEST_MODE -std=c++17 -c ../tests/unit/test_main.cpp -o tests/unit/test_main.o",
    "file": "/home/user/my_project/tests/unit/test_main.cpp"
  }
]
```

:::tip
其中，"directory" 字段记录的"编译该文件时的工作目录"，指的是编译器在编译这个源文件时所处目录的绝对路径，而"command" 字段中的编译选项，如 -I../include 等，都是相对于此"基准目录"进行解析的。:
:::

#### 自动搜索逻辑
&emsp;&emsp;当没有配置 --compile-commands-dir 参数，或者其值指定目录下不存在 compile_commands.json 文件时，clangd 都会执行一种自动搜索逻辑的策略寻找该 json 文件，具体为：

1. **以"当前打开的文件"为起点**
   clangd 的搜索会从**用户正在编辑的文件所在目录**开始。例如，假设你正在编辑 /home/user/my_project/src/main.cpp 文件，clangd 会从 /home/user/my_project/src 目录开始搜索 compile_commands.json 文件。
2. **逐级向上搜索父目录**
   如果在当前目录没有找到目标 compile_commands.json 文件，clangd 会继续向上搜索其父目录，直到找到该文件，或到达文件系统的根目录为止。例如，继续上诉例子，clangd 会依次检查以下目录：
   - /home/user/my_project/src/
   - /home/user/my_project/
   - /home/user/
   - /home/
   - /
3. **优先识别"项目根目录"**
   为了避免无意义的全局搜索，或误将其他项目的 compile_commands.json 文件纳入考虑，clangd 会优先识别一些典型的"项目根目录"标志，如 .git、.hg、.svn 等版本控制目录。如果在搜索过程中遇到这些标志目录或文件，clangd 会将其所在目录视为项目根目录，并优先在该目录下寻找 compile_commands.json 文件。
4. **检查常见构建项目**
   在项目根目录下，clangd 会额外检查一些约定俗成的构建目录，如 build、build-dir、out、cmake-build-debug 等，这些目录通常时构建系统生成编译产物的地方，可能会包含 compile_commands.json 文件。
5. **停止条件**
   clangd 的搜索会在以下两种情况下停止：
   - 找到了 compile_commands.json 文件，停止搜索并使用该文件；
   - 达到了项目根目录，仍未找到，则使用默认配置（可能会解析错误）。



&emsp;&emsp;生成 compile_commands.json 的方式有多种，最常见的是通过 CMake 构建系统进行生成。

#### 使用 CMake 生成（适用于 CMake 项目）
```bash "-DCMAKE_EXPORT_COMPILE_COMMANDS=ON"
# 进入项目目录
cd your_project\

# 创建 build 目录并生成编译数据库
mkdir build && cd build
cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=ON .. # 关键参数，导出编译命令
```
&emsp;&emsp;生成后，build/compile_commands.json 文件会被 clangd 自动识别（对应配置中的 --compile-commands-dir）。

#### 使用 Bear 生成（适用非 CMake 项目，如 Make）
&emsp;&emsp;简单说，bear 是一个"编译命令捕获工具"，它并不依赖特定的构建系统，而是通过监控整个构建过程，提取每一源文件的实际编译命令，从而生成最终的 compile_commands.json 文件，专门为**非CMake 构建系统**（如 Make等）生成编译数据库的工具。

> &emsp;&emsp;bear 捕获编译命令不意味着会改变或干预项目构建过程，只是作为一个监控者，记录下编译器调用的相关信息，并将其整理为 compile_commands.json 文件，所以编译命令还是会实际执行的。

```bash
# 安装 bear
sudo apt install bear

# 使用 bear 生成
bear make
```

#### 手动创建（适用于简单项目）
&emsp;&emsp;前面我们介绍了 compile_commands.json 的数据格式，对于一些简单的项目，也可以手动创建该文件，这里不再赘述。

### 5. 推荐使用项目级配置 .clangd
&emsp;&emsp;前面介绍了如何在 vscode 的 setting.json 中配置 clangd，而 .clangd 文件作为 clangd 的原生配置文件，支持更多的高级配置选项，推荐在项目根目录下创建 .clangd 文件进行项目级配置。并且 **clangd 会优先读取 .clangd 文件中的配置**，覆盖 vscode setting.json 中的同名配置项。

&emsp;&emsp;.clangd 使用 YAML 格式，以下是一个示例配置：
```yaml
# .clangd 配置文件（YAML 格式，注意缩进）

# -------------------------- 编译相关配置 --------------------------
# 编译数据库（compile_commands.json）的搜索路径
# 若文件不在项目根目录，可指定相对/绝对路径（如 build/compile_commands.json）
CompileFlags:
  # 额外添加的编译选项（覆盖 compile_commands.json 中的部分配置）
  Add: [-Wall, -Wextra, -Werror=return-type]  # 启用常见警告，返回值未处理视为错误
  Remove: [-Wno-unused-parameter]  # 移除不需要的编译选项（如允许未使用参数的警告）
  # 强制指定 C/C++ 标准（若 compile_commands 未明确指定）
  Compiler: clang  # 默认为系统默认编译器，可指定 clang/clang++ 路径
  Standard: c++17  # 例如 c++11/c++20，C 项目用 c11/c17


# -------------------------- 索引相关配置 --------------------------
Index:
  # 是否后台构建索引（默认 true，建议开启以提升首次加载速度）
  Background: true
  # 索引存储目录（默认在系统临时目录，指定后可复用索引，加速后续启动）
  StoreDirectory: .clangd/index  # 项目内的隐藏目录，需手动创建或确保权限
  # 索引文件大小限制（默认 2GB，可按需调整）
  MaxFileSize: 104857600  # 100MB


# -------------------------- 格式化配置 --------------------------
Format:
  # 格式化风格（优先使用项目内的 .clang-format 文件）
  Style: file  # 可选：llvm/google/mozilla/webkit，或自定义文件路径
  # 若未找到 .clang-format，使用的备用风格
  Fallbacks: [llvm]
  # 是否在保存时自动格式化（部分编辑器需配合插件，如 VS Code 的 clangd 插件）
  OnSave: false  # 建议手动触发，避免冲突


# -------------------------- 诊断（警告/错误）配置 --------------------------
Diagnostics:
  # 未使用的 #include 提示级别（Strict/None，默认 Strict）
  UnusedIncludes: Strict  # 严格提示未使用的头文件，或 None 关闭
  # 抑制特定警告（格式：[-Wwarning-name]）
  Suppress:
    - -Wunused-variable  # 忽略未使用变量的警告
    - -Wdeprecated-declarations  # 忽略已废弃接口的警告
  # 诊断信息的详细程度（Brief/Full，默认 Full）
  Detail: Full


# -------------------------- 补全与代码提示 --------------------------
Completion:
  # 是否显示“不合格”的补全项（如不可访问的私有成员，默认 false）
  IncludeIneligible: true  # 开发调试时可开启，查看更多候选
  # 补全时是否包含所有作用域的符号（默认 false，仅当前作用域）
  AllScopes: false  # 大型项目建议关闭，避免补全列表过长
  # 补全优先级：更倾向于项目内符号还是标准库（Local/Global，默认 Local）
  Priority: Local


# -------------------------- 悬停提示配置 --------------------------
Hover:
  # 悬停时显示的信息详细程度（Brief/Full，默认 Full）
  Detail: Full  # 显示完整的类型、注释、定义位置等


# -------------------------- 内嵌提示（Inlay Hints） --------------------------
InlayHints:
  # 函数参数名提示（如 func(a) 显示为 func(param=a)）
  ParameterNames: true
  # 变量类型提示（如 auto x = 1 显示为 int x = 1）
  DeducedTypes: true
  #  lambda 捕获提示（如 [x] 显示为 [x = copy]）
  LambdaCaptures: true


# -------------------------- 其他实用配置 --------------------------
# 日志级别（Error/Warn/Info/Debug，默认 Info）
Log:
  Level: Info
  # 日志输出路径（默认 stderr，可指定文件）
  File: .clangd/clangd.log

# 启用 clangd 扩展功能（如交叉引用、重构等）
Features:
  CompletionDetailedLabel: true  # 补全项显示更详细的标签（如函数参数类型）
  IncludeFixer: true  # 自动添加缺失的 #include（需配合 clang-include-fixer 工具）
```

## 总结
&emsp;&emsp;通过上述步骤，你应该能够在 vscode 中成功配置并使用 clangd，提升 C/C++ 的开发体验。告别 c_cpp_properties.json，拥抱 compile_commands.json 吧，祝你编码愉快！