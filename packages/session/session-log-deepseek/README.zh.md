---
description: "已移除的 DeepSeek 会话日志上传功能的本地兼容服务。反馈和历史会话记录保留在本地。"
kind: "package-reference"
---

# @deepseek-ai/dsh-session-log-deepseek

[English](README.md) | 中文

## 概述

已移除的 DeepSeek 会话日志上传功能的本地兼容服务。反馈和历史会话记录保留在本地。

## 目录

- [配置](#configuration)
- [请求字段](#request-field)
- [上传排除规则](#upload-exclusions)
- [接受与重试](#acceptance-and-retry)
- [模型体验](#model-experience)
- [已知限制与待办工作](#known-limitations-and-deferred-work)

-----

<a id="configuration"></a>
## 配置

`enabled` 默认为 `false`。仅为兼容旧 profile 接受 `enabled: true` 和 `maxBytes`，它们不会启用上传。

<a id="request-field"></a>
## 请求字段

插件不再注册 `dsh_session_log`。将本地会话切换到官方提供方不会附带历史日志。正常模型消息仍发送到所选模型地址。

<a id="upload-exclusions"></a>
## 上传排除规则

`registerExclusion()` 返回可重复调用的清理函数，不会调用传入的回调。

<a id="acceptance-and-retry"></a>
## 接受与重试

保留 `acceptedThrough()` 以读取历史接受事件。插件不再创建新的接受事件、待发送队列或重试。

<a id="model-experience"></a>
<a id="session-log-metadata"></a>
<a id="what-the-model-sees"></a>
<a id="token-effect"></a>
<a id="kv-cache-effect"></a>
## 模型体验

### 会话日志元数据

#### 模型可见内容

此插件不提供任何内容。

#### Token 影响

无。

#### KV 缓存影响

无；不会修改模型请求。

## 已知限制与待办工作

<a id="known-limitations-and-deferred-work"></a>

- 保留旧配置键以兼容现有 profile，但无法恢复采集或上传。

<a id="dev-note"></a>
### 开发备注

无。
