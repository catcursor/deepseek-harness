import { Context } from '@deepseek-ai/cordis'
import { afterEach, expect, it, vi } from 'vitest'
import Analytics from '../src/index.ts'

const contexts: Context[] = []
afterEach(async () => {
  await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose()))
  vi.clearAllMocks()
})

it.each([false, true])('does not inspect identity or hardware with legacy enabled=%s', async (enabled) => {
  const ctx = new Context()
  contexts.push(ctx)
  const getDeviceIdentity = vi.fn()
  const emit = vi.fn()
  ctx.provide('deepseekAccount', { getDeviceIdentity } as never)
  ctx.provide('productTelemetry', { emit } as never)
  ctx.provide('webServer', {} as never)
  await ctx.plugin(Analytics, { enabled })
  expect(ctx.productAnalytics.enabled()).toBe(false)
  await ctx.productAnalytics.report({ eventName: 'desktop_app_launch', timestamp: 1, attributes: {} })
  await ctx.productAnalytics.report({ eventName: 'plugin_install_click', timestamp: 2, attributes: { input_value: 'private-package' } })
  expect(getDeviceIdentity).not.toHaveBeenCalled()
  expect(emit).not.toHaveBeenCalled()
})

it('closes a disabled policy stream on abort without requiring account or exporter services', async () => {
  const ctx = new Context()
  contexts.push(ctx)
  ctx.provide('webServer', {} as never)
  await ctx.plugin(Analytics, { enabled: true })
  const controller = new AbortController()
  const stream = ctx.productAnalytics.watchPolicy(controller.signal)[Symbol.asyncIterator]()
  expect(await stream.next()).toEqual({ value: false, done: false })
  const pending = stream.next()
  controller.abort()
  expect((await pending).done).toBe(true)
})
