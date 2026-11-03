---
description: "Local compatibility sink for removed Desktop usage statistics. Submitted events are discarded without serialization, buffering, or network activity."
kind: "package-reference"
---

# @deepseek-ai/dsh-host-product-telemetry-otel

English | [中文](README.zh.md)

## Summary

Local compatibility sink for removed Desktop usage statistics. Submitted events are discarded without serialization, buffering, or network activity.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)

-----

<a id="use-this-package"></a>
## Use this package

Existing compositions may retain `ctx.productTelemetry.emit()`. Calls have no effect; no OTel provider or collector is needed.

<a id="understand-the-implementation"></a>
## Understand the implementation

The class only registers its local service. Legacy transport settings are parsed but ignored, and the default endpoint is empty.

<a id="further-exploration"></a>
## Further Exploration

[Product telemetry reference](../../../docs/subsystems/product-telemetry.md).

<a id="model-experience"></a>
<a id="kv-cache-effect"></a>
## Model Experience

None, as this compatibility service collects no data and modifies no model requests.

#### KV Cache effect

None; no model request is changed.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- Legacy configuration keys remain accepted for existing profiles, but cannot restore collection or upload.

<a id="dev-note"></a>
### Dev Note

None.
