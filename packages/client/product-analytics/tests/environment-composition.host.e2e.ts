import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'
import { runLoaderSmoke, LOADER_SMOKE_TEST_TIMEOUT_MS } from '@deepseek-ai/dsh-loader-smoke'

it('keeps legacy enabled Desktop analytics local through Loader and OTLP composition', async () => {
  const driver = resolve(import.meta.dirname, 'fixtures/environment.host.ts')
  let captured: unknown
  await runLoaderSmoke({
    label: 'Desktop analytics removed', tempDirPrefix: 'product-environment-',
    binScript: driver, libBinScript: driver,
    configPath: resolve(import.meta.dirname, 'fixtures/environment.patch.yml'),
    tsconfigPath: resolve(import.meta.dirname, '../../../../tsconfig.base.json'),
    inspect: async (cwd) => { captured = JSON.parse(await readFile(resolve(cwd, 'captures.json'), 'utf8')) },
  })
  expect(captured).toMatchObject({ captures: [] })
}, LOADER_SMOKE_TEST_TIMEOUT_MS)
