---
description: "Local disabled sharing service for removed feedback-triggered Session uploads. No history capture, anonymous identity, queue, or HTTP exporter is created."
kind: "package-reference"
---

# @deepseek-ai/dsh-session-telemetry-otel

English | [中文](README.zh.md)

## Summary

Local disabled sharing service for removed feedback-triggered Session uploads. No history capture, anonymous identity, queue, or HTTP exporter is created.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)

-----

<a id="use-this-package"></a>
## Use this package

Existing profiles may retain this plugin. `ctx.sessionTelemetry.sharing` always reports `disabled`; feedback remains in the local Session log.

<a id="modes"></a>
### Modes

The default is `DISABLED`. The legacy `FEEDBACK_ONLY` value is accepted but cannot enable uploads.

<a id="minimal-configuration"></a>
### Minimal configuration

No collector URL or credentials are needed. Legacy exporter, processor, byte, and timeout options are ignored.

<a id="what-leaves-the-machine"></a>
### What leaves the machine

Nothing from this plugin, including after text feedback, rating edits, withdrawal, restoration, or shutdown.

<a id="failures-and-shutdown"></a>
### Failures and shutdown

`shutdown()` completes immediately because no queue, timer, or connection exists.

<a id="understand-the-implementation"></a>
## Understand the implementation

The service registration preserves existing integrations without constructing an OTel reporter or capture coordinator.

<a id="design-concept"></a>
### Design concept

Feedback is local data; legacy configuration cannot authorize export.

<a id="source-map"></a>
### Source map

[Implementation](src/index.ts).

<a id="capture-wiring"></a>
### Capture wiring

No Session or feedback listeners are registered.

<a id="field-mapping"></a>
### Field mapping

No events are serialized or mapped to OTLP records.

<a id="further-exploration"></a>
## Further Exploration

[Sharing service reference](../../../docs/subsystems/session-telemetry.md).

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
