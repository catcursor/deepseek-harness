---
description: "已移除的反馈触发会话上传功能的本地禁用状态服务。不采集历史、不创建匿名身份、队列或 HTTP 导出器。"
kind: "package-reference"
---

# @deepseek-ai/dsh-session-telemetry-otel

[English](README.md) | 中文

## 概述

已移除的反馈触发会话上传功能的本地禁用状态服务。不采集历史、不创建匿名身份、队列或 HTTP 导出器。

## 目录

- [使用此包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与待办工作](#known-limitations-and-deferred-work)

-----

<a id="use-this-package"></a>
## 使用此包

现有 profile 可保留此插件。`ctx.sessionTelemetry.sharing` 始终为 `disabled`；反馈保留在本地会话日志中。

<a id="modes"></a>
### 模式

默认为 `DISABLED`。接受旧值 `FEEDBACK_ONLY`，但不会启用上传。

<a id="minimal-configuration"></a>
### 最小配置

无需采集端地址或凭据。忽略旧 exporter、processor、字节数和超时选项。

<a id="what-leaves-the-machine"></a>
### 离开本机的数据

此插件不会外发任何数据，包括文本反馈、评分编辑、撤回、恢复会话或退出后。

<a id="failures-and-shutdown"></a>
### 失败与关闭

由于没有队列、计时器或连接，`shutdown()` 立即完成。

<a id="understand-the-implementation"></a>
## 理解实现

保留服务注册以兼容现有集成，不再创建 OTel 上报器或采集协调器。

<a id="design-concept"></a>
### 设计概念

反馈是本地数据；旧配置无法授权导出。

<a id="source-map"></a>
### 源码索引

[实现](src/index.ts)。

<a id="capture-wiring"></a>
### 采集连接

不注册会话或反馈监听器。

<a id="field-mapping"></a>
### 字段映射

不序列化事件，也不映射到 OTLP 记录。

<a id="further-exploration"></a>
## 进一步探索

[共享状态服务参考](../../../docs/subsystems/session-telemetry.zh.md)。

<a id="model-experience"></a>
<a id="kv-cache-effect"></a>
## 模型体验

没有面向模型的贡献。

#### KV 缓存影响

无；不会修改模型请求。

## 已知限制与待办工作

<a id="known-limitations-and-deferred-work"></a>

- 保留旧配置键以兼容现有 profile，但无法恢复采集或上传。

<a id="dev-note"></a>
### 开发备注

无。
