---
description: "已移除的桌面版使用统计的本地兼容接收器。丢弃提交的事件，不序列化、不缓冲、不联网。"
kind: "package-reference"
---

# @deepseek-ai/dsh-host-product-telemetry-otel

[English](README.md) | 中文

## 概述

已移除的桌面版使用统计的本地兼容接收器。丢弃提交的事件，不序列化、不缓冲、不联网。

## 目录

- [使用此包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与待办工作](#known-limitations-and-deferred-work)

-----

<a id="use-this-package"></a>
## 使用此包

现有组合可保留 `ctx.productTelemetry.emit()`。调用无效果；无需 OTel 提供方或采集端。

<a id="understand-the-implementation"></a>
## 理解实现

此类仅注册本地服务。解析但忽略旧传输设置，默认地址为空。

<a id="further-exploration"></a>
## 进一步探索

[产品统计参考](../../../docs/subsystems/product-telemetry.zh.md)。

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
