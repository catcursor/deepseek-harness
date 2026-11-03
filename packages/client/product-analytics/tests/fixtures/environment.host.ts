/** Real Host environment collection through the shipped profile and isolated OTLP receiver. */
import { createServer } from 'node:http'
import { once } from 'node:events'
import { writeFile } from 'node:fs/promises'
import type {} from '@deepseek-ai/dsh-client-product-analytics'
import { bootProductionProfile } from '../../../../test-support/loader-smoke/tests/fixtures/production-profile.ts'

const overlay = process.argv[2]
if (overlay === undefined) throw new Error('environment fixture requires its overlay')
const captures: unknown[] = []
const receiver = createServer((req, res) => {
  const chunks: Buffer[] = []
  req.on('data', (chunk: Buffer) => { chunks.push(chunk) })
  req.on('end', () => { captures.push(JSON.parse(Buffer.concat(chunks).toString())); res.end('{}') })
})
try {
  receiver.listen(0, '127.0.0.1')
  await once(receiver, 'listening')
  const address = receiver.address()
  if (address === null || typeof address === 'string') throw new Error('environment collector has no port')
  process.env.DSH_PRODUCT_TELEMETRY_TEST_ENDPOINT = `http://127.0.0.1:${address.port}/logs`
  const ctx = await bootProductionProfile({ binName: 'environment-test', profile: 'headless', overlayPaths: [overlay],
    prepare: (root) => { root.provide('deepseekAccount', { getDeviceIdentity: async () => undefined } as never) },
  })
  try {
    const analytics = ctx.get('productAnalytics')
    if (analytics === undefined) throw new Error('environment analytics did not mount')
    await analytics.report({ eventName: 'desktop_app_launch', timestamp: 1_800_000_000_000, attributes: {} })
  } finally { await ctx.fiber.dispose() }
  await writeFile('captures.json', JSON.stringify({ captures }))
} finally {
  const closed = once(receiver, 'close')
  receiver.close()
  receiver.closeAllConnections()
  await closed
}
