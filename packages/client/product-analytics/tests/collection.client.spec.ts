import { Context } from '@deepseek-ai/cordis'
import { afterEach, expect, it, vi } from 'vitest'
import * as Analytics from '../src/client/index.ts'

const contexts: Context[] = []
afterEach(async () => {
  await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose()))
  vi.unstubAllGlobals()
})

it.each([false, true])('does not collect or open Remote streams in desktop=%s', async (desktop) => {
  if (desktop) vi.stubGlobal('dshDesktop', {})
  const ctx = new Context()
  contexts.push(ctx)
  const report = vi.fn()
  const watchPolicy = vi.fn()
  const stream = vi.fn()
  ctx.provide('remote', { productAnalytics: { report, watchPolicy }, $stream: stream } as never)
  await ctx.plugin(Analytics)
  expect(ctx.productAnalytics.enabled).toBe(false)
  ctx.productAnalytics.track('desktop_app_launch', {})
  ctx.productAnalytics.track('plugin_install_click', { input_value: 'private-package' }, 123)
  expect(report).not.toHaveBeenCalled()
  expect(watchPolicy).not.toHaveBeenCalled()
  expect(stream).not.toHaveBeenCalled()
})
