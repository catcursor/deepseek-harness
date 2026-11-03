/** Desktop renderer analytics sender; browser applications have no collection capability. */
import { Service, type Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-gateway/client'
export type {} from '@deepseek-ai/dsh-client-product-analytics/remote'
import type { ProductEventMap } from '../events.ts'
export type {
  AnalyticsPreset, EntryAnalyticsRegion, ProductEvent, ProductEventMap,
  SidebarAnalyticsEntry, SidebarAnalyticsPosition, TrackProductEvent,
} from '../events.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    productAnalytics: DesktopAnalytics
  }
}

class DesktopAnalytics extends Service {
  constructor(ctx: Context) { super(ctx, 'productAnalytics') }

  /** Collection is permanently disabled, including after reconnect. */
  get enabled(): boolean { return false }

  /**
   * Ignore legacy event calls without creating an RPC or retaining their arguments.
   * @param _name - obsolete event name.
   * @param _attributes - discarded event fields.
   * @param _timestamp - discarded occurrence time.
   */
  track<K extends keyof ProductEventMap>(_name: K, _attributes: ProductEventMap[K], _timestamp?: number): void {}
}

/** No Remote capability is needed by the local compatibility service. */
export const inject: string[] = []

/** @param ctx - browser application context. */
export function apply(ctx: Context): void { ctx.plugin(DesktopAnalytics) }
