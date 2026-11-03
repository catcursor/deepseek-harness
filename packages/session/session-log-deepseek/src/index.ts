/** Local compatibility service for retired DeepSeek Session-log uploads. */
import { Service, type Context, type Volatile } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-deepseek-llm-api-extensions'
import { SessionLogOffset, SessionSeq } from '@deepseek-ai/dsh-session'
import type { Session, SessionLogOffset as SessionLogOffsetType, SessionSeq as SessionSeqType, SessionSeqCursor } from '@deepseek-ai/dsh-session'
import type { SessionLogUploadExclusion } from './types.ts'

export type * from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context { sessionLogDeepSeek: SessionLogDeepSeekService }
}

/** Legacy plugin name retained for existing profiles. */
export const name = 'session-log-deepseek'
/** The retired uploader requires no external services. */
export const inject: string[] = []

/** Legacy configuration accepted without enabling uploads. */
export interface Config {
  /** Ignored; Session-log contribution has been removed. */
  enabled: Volatile<boolean>
  /** Legacy byte limit, unused because no log is serialized. */
  maxBytes: number
}

/** Parse existing profiles without restoring the removed uploader. */
export const Config = z.object({
  enabled: z.boolean().default(false).volatile(),
  maxBytes: z.number().step(1).min(1).default(8 * 1024 * 1024),
})

interface AcceptanceFold {
  readonly scannedEvents: SessionLogOffsetType
  readonly throughSeq: SessionSeqCursor
}

const acceptanceFolds = new WeakMap<Session, AcceptanceFold>()

/**
 * Highest confirmed sequence for this exact Session format generation.
 * @param session - canonical log whose matching acceptance events are folded.
 * @returns greatest accepted sequence, or `-1` before any accepted request.
 */
export function acceptedThrough(session: Session): SessionSeqCursor {
  const previous = acceptanceFolds.get(session)
  let throughSeq = previous?.throughSeq ?? -1
  const length = session.seq
  const start = previous?.scannedEvents ?? SessionLogOffset(0)
  for (let index = start; index < length; index++) {
    // oxlint-disable-next-line typescript/no-deprecated -- Existing Session history read; migration deferred.
    const event = session.eventAt(SessionSeq(index))
    if (event === undefined) {
      throw new Error(`session-log-deepseek: missing event ${String(index)} below captured length ${String(length)}`)
    }
    if (event.type !== 'session-log-deepseek/delivery-accepted') continue
    const acceptedFormatVersion = event.data.sessionFormatVersion ?? 0
    if (!Number.isSafeInteger(acceptedFormatVersion)
      || acceptedFormatVersion < 0
      || Object.is(acceptedFormatVersion, -0)) {
      throw new Error(`session-log-deepseek: malformed acceptance format version at seq ${event.seq}`)
    }
    if (acceptedFormatVersion !== session.header.version) continue
    let acceptedSeq: SessionSeqType
    try {
      acceptedSeq = SessionSeq(event.data.throughSeq)
    } catch {
      throw new Error(`session-log-deepseek: malformed acceptance watermark at seq ${event.seq}`)
    }
    if (typeof event.data.sessionId !== 'string' || event.data.sessionId.length === 0
      || acceptedSeq >= event.seq) {
      throw new Error(`session-log-deepseek: malformed acceptance watermark at seq ${event.seq}`)
    }
    if (event.data.sessionId !== session.id) continue
    if (acceptedSeq > throughSeq) throughSeq = acceptedSeq
  }
  acceptanceFolds.set(session, { scannedEvents: length, throughSeq })
  return throughSeq
}

/** Local compatibility registration; no request contributor or capture listener is installed. */
export class SessionLogDeepSeekService extends Service {
  static inject = inject

  constructor(ctx: Context, _config: Config) {
    super(ctx, 'sessionLogDeepSeek')
  }

  /**
   * Accept a legacy exclusion without reading a Session or preparing an upload.
   * @param _exclude - obsolete exclusion callback; never invoked.
   * @returns an idempotent local disposer.
   */
  registerExclusion(_exclude: SessionLogUploadExclusion): () => Promise<void> {
    return () => Promise.resolve()
  }
}

/**
 * Register the local compatibility service for existing profiles.
 * @param ctx - plugin context.
 * @param config - legacy configuration; cannot enable uploads.
 */
export async function apply(ctx: Context, config: Config): Promise<void> {
  await ctx.plugin(SessionLogDeepSeekService, config)
}
