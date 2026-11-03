/** Local compatibility sink for removed product analytics. */
import { Context, Service } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type { OTelEventRecord, OTelEventScalar } from '@deepseek-ai/dsh-otel'

declare module '@deepseek-ai/cordis' {
  interface Context { productTelemetry: ProductTelemetry }
}

/** Caller-selected ordinary analytics record. */
export type ProductTelemetryRecord = OTelEventRecord
/** Scalar values accepted in product attributes. */
export type ProductTelemetryScalar = OTelEventScalar

/** Legacy options parsed for existing profiles; all transport settings are ignored. */
export interface Config {
  /** Full HTTP(S) logs URL. */
  endpoint: string
  /** Collector routing header. */
  channel: string
  /** Resource service.name supplied by the application composition. */
  serviceName: string
  /** Resource service.version supplied by the application composition. */
  serviceVersion: string
  /** Omit to honor OTEL_EXPORTER_OTLP_LOGS_COMPRESSION / OTEL_EXPORTER_OTLP_COMPRESSION. */
  compression?: 'none' | 'gzip'
  /** Maximum records per export; must not exceed maxQueueSize. */
  maxExportBatchSize: number
  /** Maximum queued records; the SDK drops new records when full. */
  maxQueueSize: number
  /** Delay before exporting a partial batch. */
  scheduledDelayMillis: number
  /** Exporter HTTP deadline, including SDK transient-error retries. */
  timeoutMillis: number
  /** Processor deadline for one batch export. */
  exportTimeoutMillis: number
  /** Drain deadline; expiry cancels pending exports before disposal completes. */
  shutdownTimeoutMillis: number
}

const positiveInteger = () => z.number().step(1).min(1).max(2_147_483_647)

/** Loader validation and defaults for application compositions. */
export const Config: z<Partial<Config>, Config> = z.object({
  endpoint: z.string().default(''),
  channel: z.string().min(1).default('dsh_otel_report'),
  serviceName: z.string().required(),
  serviceVersion: z.string().required(),
  compression: z.union(['none', 'gzip']),
  maxExportBatchSize: positiveInteger().default(512),
  maxQueueSize: positiveInteger().default(2048),
  scheduledDelayMillis: positiveInteger().default(30000),
  timeoutMillis: positiveInteger().default(15000),
  exportTimeoutMillis: positiveInteger().default(20000),
  shutdownTimeoutMillis: positiveInteger().default(21000),
})

/** Compatibility sink for removed Desktop analytics; creates no exporter or queue. */
export default class ProductTelemetry extends Service {
  static inject: string[] = []
  static Config = Config

  constructor(ctx: Context, _config: Config) { super(ctx, 'productTelemetry') }

  /**
   * Discard an event without collection or upload.
   * @param _record - obsolete event fields.
   */
  emit(_record: ProductTelemetryRecord): void {}
}
