---
description: "Disabled Host and renderer compatibility services for removed Desktop analytics. No usage events, account identity, hardware sampling, or reporting RPCs are collected."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-product-analytics

English | [中文](README.zh.md)

## Summary

Disabled Host and renderer compatibility services for removed Desktop analytics. No usage events, account identity, hardware sampling, or reporting RPCs are collected.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)

-----

<a id="use-this-package"></a>
## Use this package

Both Host `enabled()` and renderer `enabled` always return `false`, including with legacy `enabled: true`. `report()` and `track()` discard their input.

<a id="navigation-preset-and-new-session-events"></a>
### Navigation, preset, and new-session events

Existing UI callers may retain typed event names; no event is sent or retained.

<a id="understand-the-implementation"></a>
## Understand the implementation

The Host has no account or exporter dependency and never samples environment metadata. The renderer creates no Remote policy stream or reporting request. Legacy Host policy streams report disabled until cancelled or disposed.

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
