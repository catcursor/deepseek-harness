import { Context } from '@deepseek-ai/cordis'
import { afterEach, expect, it, vi } from 'vitest'
import ProductTelemetry, { Config } from '../src/index.ts'

const contexts: Context[] = []
afterEach(async () => { await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose())) })

it('does not construct an exporter or queue even with a legacy collector configuration', async () => {
  const ctx = new Context()
  contexts.push(ctx)
  const createEventReporter = vi.fn(() => { throw new Error('must not construct an exporter') })
  ctx.provide('otel', { createEventReporter } as never)
  const fiber = await ctx.plugin(ProductTelemetry, {
    endpoint: 'https://collector.invalid/v1/logs', serviceName: 'test', serviceVersion: '1',
    maxExportBatchSize: 1, scheduledDelayMillis: 1,
  })
  ctx.productTelemetry.emit({ eventName: 'desktop_app_launch', timestamp: 1, body: 'private event', attributes: { user_id: 'private-user' } })
  await fiber.dispose()
  expect(createEventReporter).not.toHaveBeenCalled()
})

it('has no default collector and mounts without an OTel provider', async () => {
  expect(Config({ serviceName: 'test', serviceVersion: '1' }).endpoint).toBe('')
  const ctx = new Context()
  contexts.push(ctx)
  await ctx.plugin(ProductTelemetry, { serviceName: 'test', serviceVersion: '1' })
  ctx.productTelemetry.emit({ eventName: 'desktop_app_launch', timestamp: 1, body: 'discarded' })
})
