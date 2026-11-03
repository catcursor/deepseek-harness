---
kind: upgrade-guide
description: "Feedback upload, Desktop statistics, and automatic DeepSeek Session-log contribution are removed."
---

# Session and Desktop telemetry removal

English | [中文](guide.zh.md)

## Change

This fork removes feedback-triggered Session exports, Desktop event and hardware collection, and the `dsh_session_log` contribution attached to DeepSeek requests. Switching a locally recorded Session to the official provider does not upload its canonical history. Local feedback and historical Session formats remain available. Legacy plugin names and configuration fields are accepted but cannot restore these removed paths. The General settings upload switch is removed.

## Migration

1. Restart every running Harness process using the rebuilt application; an older process still contains its previous upload code.
2. Remove obsolete `session-log-deepseek.enabled`, `session-telemetry-otel.exporter`, and product telemetry collector overrides from custom patches when convenient. Existing values are ignored.
3. Confirm `ctx.sessionTelemetry.sharing` is `disabled` and feedback remains in the local Session log. Sending feedback, using Desktop controls, and switching models no longer starts either removed exporter or attaches `dsh_session_log`.

Normal conversation context still goes to the selected model endpoint. Plugin package inventory, provider identity headers, search, file inputs, remote tools, and explicitly opened contact forms retain their existing behavior.
