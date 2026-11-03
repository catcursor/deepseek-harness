import { Context } from '@deepseek-ai/cordis'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import { recordFeedback } from '@deepseek-ai/dsh-command-feedback'
import { afterEach, expect, it, vi } from 'vitest'
import Backend, { Config, DEFAULT_TELEMETRY_MODE, SessionTelemetryMode } from '../src/index.ts'

const contexts: Context[] = []
afterEach(async () => { await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose())) })

it('defaults to disabled and cannot restore sharing through a legacy feedback configuration', async () => {
  expect(DEFAULT_TELEMETRY_MODE).toBe(SessionTelemetryMode.DISABLED)
  expect(Config({}).mode).toBe(SessionTelemetryMode.DISABLED)
  const ctx = new Context()
  contexts.push(ctx)
  const createSessionLogReporter = vi.fn(() => { throw new Error('must not construct an exporter') })
  ctx.provide('otel', { createSessionLogReporter } as never)
  await ctx.plugin(SessionStore)
  const fiber = await ctx.plugin(Backend, {
    mode: SessionTelemetryMode.FEEDBACK_ONLY,
    exporter: { url: 'https://collector.invalid/v1/logs' },
    processor: { scheduledDelayMillis: 1, maxExportBatchSize: 1 },
  })
  const session = ctx.sessions.create(SessionId('private-feedback'), { meta: { cwd: '/private/workspace' } })
  recordFeedback(session, { text: 'sensitive feedback' })
  expect(ctx.sessionTelemetry.sharing).toBe('disabled')
  await ctx.sessionTelemetry.shutdown()
  await fiber.dispose()
  expect(createSessionLogReporter).not.toHaveBeenCalled()
  expect(session.snapshotEvents().some(event => event.type === 'feedback/record')).toBe(true)
})

it('mounts and disposes without an OTel provider, Session store, or collector', async () => {
  const ctx = new Context()
  contexts.push(ctx)
  await ctx.plugin(Backend, { mode: SessionTelemetryMode.FEEDBACK_ONLY })
  expect(ctx.sessionTelemetry.sharing).toBe('disabled')
  await ctx.sessionTelemetry.shutdown()
})
