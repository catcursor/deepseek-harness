/** Local compatibility backend for removed feedback-triggered Session uploads. */
import z from '@deepseek-ai/schemastery'
import type { Context } from '@deepseek-ai/cordis'
import { SessionTelemetryBackend } from '@deepseek-ai/dsh-session-telemetry'
import type { SessionTelemetryRecord, SessionTelemetrySharingStatus } from '@deepseek-ai/dsh-session-telemetry'
import type { LogExporterOptions, SessionLogProcessorOptions } from '@deepseek-ai/dsh-otel'

/** Legacy mode values accepted by existing profiles; neither enables collection. */
export enum SessionTelemetryMode {
  FEEDBACK_ONLY = 'FEEDBACK_ONLY',
  DISABLED = 'DISABLED',
}

/** Session uploads are permanently disabled in this fork. */
export const DEFAULT_TELEMETRY_MODE = SessionTelemetryMode.DISABLED

/** Legacy options parsed for existing profiles; no value enables capture or transport. */
export interface Config {
  /** Ignored sharing request; the backend always reports disabled. */
  mode?: SessionTelemetryMode
  /** Ignored exporter configuration, including collector URL and headers. */
  exporter?: Omit<LogExporterOptions, 'url'> & {
    /** Ignored legacy collector URL; no connection is opened. */
    url?: string
  }
  /** Ignored queue and timer configuration; no queue or timers are created. */
  processor?: SessionLogProcessorOptions
  /** Ignored shutdown allowance; there is no pending upload. */
  shutdownTimeoutMillis?: number
  /** Ignored legacy request-size limit. */
  maxRequestBytes?: number
}

/** Accept legacy options without constructing an exporter. */
export const Config: z<Config> = z.object({
  mode: z.union(Object.values(SessionTelemetryMode)).default(DEFAULT_TELEMETRY_MODE),
  exporter: z.any(),
  processor: z.any(),
  shutdownTimeoutMillis: z.number(),
  maxRequestBytes: z.number().step(1).min(1).max(4_000_000),
})

/** Legacy exported constant; no shutdown timer is allocated. */
export const DEFAULT_SHUTDOWN_TIMEOUT_MILLIS = 3_000

/** Keeps existing consumers informed that feedback and Session history stay local. */
export class OpenTelemetrySessionBackend extends SessionTelemetryBackend {
  static inject: string[] = []
  static Config = Config
  override readonly sharing: SessionTelemetrySharingStatus = 'disabled'

  constructor(ctx: Context, _config: Config) { super(ctx) }

  /**
   * Discard a record without serialization, buffering, or transport.
   * @param _record - obsolete event fields.
   */
  emit(_record: SessionTelemetryRecord): void {}

  /**
   * Finish without transport or queue work.
   * @returns immediate completion.
   */
  shutdown(): Promise<void> { return Promise.resolve() }
}

export default OpenTelemetrySessionBackend
