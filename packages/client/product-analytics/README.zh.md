---
description: "已移除的桌面版统计的主机端和渲染端禁用兼容服务。不采集操作事件、账号身份、硬件信息，也不发起上报 RPC。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-product-analytics

[English](README.md) | 中文

## 概述

已移除的桌面版统计的主机端和渲染端禁用兼容服务。不采集操作事件、账号身份、硬件信息，也不发起上报 RPC。

## 目录

- [使用此包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [模型体验](#model-experience)
- [已知限制与待办工作](#known-limitations-and-deferred-work)

-----

<a id="use-this-package"></a>
## 使用此包

即使旧配置为 `enabled: true`，主机端 `enabled()` 和渲染端 `enabled` 也始终返回 `false`。`report()` 和 `track()` 丢弃输入。

<a id="navigation-preset-and-new-session-events"></a>
### 导航、预设和新会话事件

现有界面调用方可保留事件名称类型；不会发送或保留事件。

<a id="understand-the-implementation"></a>
## 理解实现

主机端不依赖账号或导出器，也不采样环境元数据。渲染端不创建远程策略流或上报请求。旧主机策略流报告禁用状态，直到取消或清理。

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
