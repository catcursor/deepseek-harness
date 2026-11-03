# 产品埋点

[English](product-telemetry.md) | 中文

[产品埋点插件](../../packages/host/product-telemetry-otel/README.zh.md)与[桌面埋点消费方](../../packages/client/product-analytics/README.zh.md)保留本地兼容接口。它们不采集操作、环境信息或账号身份，不创建导出器，也不发送 RPC 或 OTLP 请求。旧配置无法恢复采集。

保留 `ProductTelemetryRecord` 和 `ProductTelemetryScalar` 以兼容调用方。接收但丢弃记录，不进行序列化、缓冲或重试。

`emit()` 同步完成。此服务没有采集端、队列或关闭任务。

## 记录类型

```ts type-equiv
/** Scalar values accepted in product attributes. */
type ProductTelemetryScalar = OTelEventScalar
```

```ts type-equiv
/** Caller-selected ordinary analytics record. */
type ProductTelemetryRecord = OTelEventRecord
```

Source: [`packages/host/product-telemetry-otel/src/index.ts`](../../packages/host/product-telemetry-otel/src/index.ts)

<!-- BEGIN GENERATED cordis-surface (gen-cordis-catalog.ts) — do not edit between markers -->

<a id="cordis-surface"></a>

## Cordis API

Generated from source by `scripts/gen-cordis-catalog.ts` (verified fresh by `pnpm run verify-cordis-catalog` in doc-sync; regenerate with `pnpm run gen-cordis-catalog`) — the language sides differ only in locale-specific paired document paths. Signature blocks use a `ts cordis-catalog` fence and keep the original source JSDoc; dispatch modes are defined in the [primer](../cordis-primer.zh.md#dispatch-modes), and the framework-inherited `ctx` API lives in [cordis-api/inherited.md](../cordis-api/inherited.md).

<a id="ctxproductanalytics--productanalytics"></a>

### `ctx.productAnalytics` — `ProductAnalytics`

Authenticated event intake; disabled instances do not inspect identity or accept new events.

```ts cordis-catalog
/**
 * Read the collection policy.
 * @returns whether this Host currently accepts Desktop analytics.
 */
@Remote enabled(): boolean

/**
 * Stream disabled status until cancellation or disposal.
 * @param signal - subscriber lifetime.
 * @returns current policy values until cancellation or service disposal.
 */
@Remote({ mode: 'stream' }) async *watchPolicy(signal: AbortSignal): AsyncIterable<boolean>

/**
 * Discard legacy events without querying identity, hardware, or an exporter.
 * @param _event - obsolete Desktop analytics event.
 * @returns immediate local completion.
 */
@Remote report(_event: ProductEvent): Promise<void>
```

Source: [`packages/client/product-analytics/src/index.ts`](../../packages/client/product-analytics/src/index.ts)

<a id="ctxproducttelemetry--producttelemetry"></a>

### `ctx.productTelemetry` — `ProductTelemetry`

Compatibility sink for removed Desktop analytics; creates no exporter or queue.

```ts cordis-catalog
/**
 * Discard an event without collection or upload.
 * @param _record - obsolete event fields.
 */
emit(_record: ProductTelemetryRecord): void
```

Source: [`packages/host/product-telemetry-otel/src/index.ts`](../../packages/host/product-telemetry-otel/src/index.ts)
<!-- END GENERATED cordis-surface -->
