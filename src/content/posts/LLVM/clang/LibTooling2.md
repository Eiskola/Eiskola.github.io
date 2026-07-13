---
title: LibTooling架构解析（二）：从 FrontendAction 到业务逻辑实现机制
published: 2026-02-27
description: 本文详细剖析LibTooling的核心架构，深入分析各组件协作机制与调用时序，帮助读者理解如何基于LibTooling构建自己的Clang工具。。
image: ./images/cover.png
tags: [llvm, clang, libtooling]
category: LLVM
draft: true
---

:::caution
&emsp;&emsp;本文内容基于 LLVM 15.0.7 版本，部分内容在其他版本中可能有所不同，请注意差异。
:::

# 前言
&emsp;&emsp;在上一篇博客[LibTooling架构解析（一）](https://eiskola.site/posts/llvm/clang/libtooling1/) 中我们对 LibTooling 的整体架构进行了概览，并讨论了其核心组件和实现机制。在本篇博客中，我们将继续分析 LibTooling 的核心架构，将重点放在余下的对 FrontendAction 的讨论上，并深入探讨从 FrontendAction 到业务逻辑实现的机制。

# FrontendAction：定制前端行为的接口
&emsp;&emsp;FrontendAction 是 LibTooling 中承载前端行为定制的核心接口。它定义了编译器在处理源代码时的行为，包括如何解析、分析和生成代码。FrontendAction 的设计使得开发者可以通过继承和重写其方法来实现自定义的前端行为，从而实现特定的业务逻辑。

## FrontendAction 的核心定义
&emsp;&emsp;FrontendAction 是一个抽象基类，定义了多个纯虚函数，以下是 FrontendAction 的核心定义:

```cpp
// clang/include/clang/Frontend/FrontendAction.h
class FrontendAction {
  FrontendInputFile CurrentInput;
  std::unique_ptr<ASTUnit> CurrentASTUnit;
  CompilerInstance *Instance;
  friend class ASTMergeAction;
  friend class WrapperFrontendAction;

private:
  std::unique_ptr<ASTConsumer> CreateWrappedASTConsumer(CompilerInstance &CI,
                                                        StringRef InFile);

protected:
  virtual bool PrepareToExecuteAction(CompilerInstance &CI) { return true; }

  virtual std::unique_ptr<ASTConsumer> CreateASTConsumer(CompilerInstance &CI,
                                                         StringRef InFile) = 0;

  virtual bool BeginInvocation(CompilerInstance &CI) { return true; }

  virtual bool BeginSourceFileAction(CompilerInstance &CI) {
    return true;
  }

  virtual void ExecuteAction() = 0;

  virtual void EndSourceFileAction() {}

  virtual bool shouldEraseOutputFiles();

public:
  FrontendAction();
  virtual ~FrontendAction();

  CompilerInstance &getCompilerInstance() const {
    assert(Instance && "Compiler instance not registered!");
    return *Instance;
  }

  void setCompilerInstance(CompilerInstance *Value) { Instance = Value; }

  bool isCurrentFileAST() const {
    assert(!CurrentInput.isEmpty() && "No current file!");
    return (bool)CurrentASTUnit;
  }

  const FrontendInputFile &getCurrentInput() const {
    return CurrentInput;
  }

  StringRef getCurrentFile() const {
    assert(!CurrentInput.isEmpty() && "No current file!");
    return CurrentInput.getFile();
  }

  StringRef getCurrentFileOrBufferName() const {
    assert(!CurrentInput.isEmpty() && "No current file!");
    return CurrentInput.isFile()
               ? CurrentInput.getFile()
               : CurrentInput.getBuffer().getBufferIdentifier();
  }

  InputKind getCurrentFileKind() const {
    assert(!CurrentInput.isEmpty() && "No current file!");
    return CurrentInput.getKind();
  }

  ASTUnit &getCurrentASTUnit() const {
    assert(CurrentASTUnit && "No current AST unit!");
    return *CurrentASTUnit;
  }

  Module *getCurrentModule() const;

  std::unique_ptr<ASTUnit> takeCurrentASTUnit() {
    return std::move(CurrentASTUnit);
  }

  void setCurrentInput(const FrontendInputFile &CurrentInput,
                       std::unique_ptr<ASTUnit> AST = nullptr);

  virtual bool isModelParsingAction() const { return false; }

  virtual bool usesPreprocessorOnly() const = 0;

  virtual TranslationUnitKind getTranslationUnitKind() { return TU_Complete; }

  virtual bool hasPCHSupport() const { return true; }

  virtual bool hasASTFileSupport() const { return true; }

  virtual bool hasIRSupport() const { return false; }

  virtual bool hasCodeCompletionSupport() const { return false; }

  bool PrepareToExecute(CompilerInstance &CI) {
    return PrepareToExecuteAction(CI);
  }

  bool BeginSourceFile(CompilerInstance &CI, const FrontendInputFile &Input);

  llvm::Error Execute();

  virtual void EndSourceFile();
};
```

&emsp;&emsp;看起来有点长，让我们一步一步来分析这个类的定义。首先是类成员变量：

### 类成员变量
#### FrontendInputFile CurrentInput
&emsp;&emsp;