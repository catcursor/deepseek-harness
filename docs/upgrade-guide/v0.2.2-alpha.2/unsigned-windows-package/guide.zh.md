---
kind: upgrade-guide
description: "Windows 未签名打包忽略发布配置，并省略强制更新服务。"
---

# Windows 未签名打包

[English](guide.md) | 中文

## 变更

`pnpm run package:desktop:win:x64:unsigned` 不再读取 `.env.windows` 或机器 preset。它与 macOS 未签名构建一样使用 `com.deepseek.harness`，排除父进程中的发布凭据及设置，不嵌入自动更新或强制更新配置。原有 Windows 未签名包若依赖自定义应用 ID 或强制更新策略，需改用签名打包流程来使用这些发布功能。

## 迁移

1. 在 Windows x64 上使用 Node 24 和[打包指南](../../../../apps/desktop/packaging/README.zh.md#unsigned-windows-test-installer)列出的构建工具运行未签名命令；无需发布 dotenv 或策略服务。
2. 在此 fork 中推送到 `master`，或手动触发 [Fork Windows installer](../../../../.github/workflows/fork-windows-package.yml)。成功后从运行页面的 Artifacts 下载安装包及校验和。
3. 确认文件名以 `-unsigned.exe` 结尾，打包元数据不包含 `dshMandatoryUpdatePolicy` 或更新 feed。后续版本通过手动安装更新；未签名产物不能进入签名发布工作流。
