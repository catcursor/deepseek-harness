---
description: "Local compatibility service for removed DeepSeek Session-log uploads. Feedback and historical Session records stay local."
kind: "package-reference"
---

# @deepseek-ai/dsh-session-log-deepseek

English | [中文](README.zh.md)

## Summary

Local compatibility service for removed DeepSeek Session-log uploads. Feedback and historical Session records stay local.

## Table of Contents

- [Configuration](#configuration)
- [Request field](#request-field)
- [Upload exclusions](#upload-exclusions)
- [Acceptance and retry](#acceptance-and-retry)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)

-----

<a id="configuration"></a>
## Configuration

`enabled` defaults to `false`. Both `enabled: true` and `maxBytes` are accepted only for legacy profiles and have no upload effect.

<a id="request-field"></a>
## Request field

The plugin never registers `dsh_session_log`. Switching a local Session to the official provider does not contribute its historical log. Ordinary model messages still go to the selected model endpoint.

<a id="upload-exclusions"></a>
## Upload exclusions

`registerExclusion()` returns an idempotent disposer without invoking the supplied callback.

<a id="acceptance-and-retry"></a>
## Acceptance and retry

`acceptedThrough()` remains available for reading historical acceptance events. The plugin creates no new acceptance event, pending queue, or retry.

<a id="model-experience"></a>

<a id="session-log-metadata"></a>

<a id="what-the-model-sees"></a>

<a id="token-effect"></a>

<a id="kv-cache-effect"></a>
## Model Experience

### Session-log metadata

#### What the model sees

No messages are contributed by `sessionLogDeepSeek`.

#### Token effect

No additional tokens are introduced by `sessionLogDeepSeek`.

#### KV Cache effect

None; no model request is changed.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- Legacy configuration keys remain accepted for existing profiles, but cannot restore collection or upload.

<a id="dev-note"></a>
### Dev Note

None.
