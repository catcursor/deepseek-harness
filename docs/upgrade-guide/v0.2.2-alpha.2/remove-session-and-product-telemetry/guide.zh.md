---
kind: upgrade-guide
description: "移除反馈上传、桌面版统计和自动附加的 DeepSeek 会话日志。"
---

# 移除会话与桌面版遥测

[English](guide.md) | 中文

## 变更

此分支移除反馈触发的会话导出、桌面操作与硬件信息采集，以及 DeepSeek 请求中的 `dsh_session_log` 附加字段。将本地记录的会话切换到官方提供方不会上传规范历史日志。本地反馈和历史会话格式仍可使用。接受旧插件名和配置字段，但无法恢复这些已移除的路径。通用设置中的上传开关已移除。

## 迁移

1. 使用重新构建的应用重启所有 Harness 进程；旧进程仍包含原有上传代码。
2. 可择机从自定义补丁中移除废弃的 `session-log-deepseek.enabled`、`session-telemetry-otel.exporter` 和产品统计采集端覆盖设置。现有值会被忽略。
3. 确认 `ctx.sessionTelemetry.sharing` 为 `disabled`，且反馈保留在本地会话日志中。发送反馈、使用桌面控件和切换模型均不会启动已移除的导出器，也不会附加 `dsh_session_log`。

正常对话上下文仍会发送到所选模型地址。插件清单、提供方身份请求头、搜索、文件输入、远程工具和主动打开的联系表单保留现有行为。
