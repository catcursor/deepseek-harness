/**
 * REAL-composition tier: explicit feedback through the shipped headless
 * Loader profile with a mock model and real shell. The collector observes
 * only the redacted authorized prefix; the canonical log keeps every event.
 */

import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { LOADER_SMOKE_TEST_TIMEOUT_MS, runLoaderSmoke } from '@deepseek-ai/dsh-loader-smoke'

const driver = fileURLToPath(new URL(
  './fixtures/driver.ts',
  import.meta.url,
))
const configPath = fileURLToPath(new URL(
  './fixtures/telemetry.patch.yml',
  import.meta.url,
))
const repoTsconfig = fileURLToPath(new URL('../../../../tsconfig.json', import.meta.url))

const FIXTURE_SECRET = 'sk-e2efixture1234567890'

interface OtlpLogRecord {
  eventName: string
  attributes?: { key: string; value: Record<string, unknown> }[]
  body?: unknown
}

interface OtlpCapture {
  resourceLogs: {
    scopeLogs: {
      scope: { name: string }
      logRecords: OtlpLogRecord[]
    }[]
  }[]
}

interface FixtureOutput {
  captures: OtlpCapture[]
  logContent: string
}

async function jsonlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const paths = await Promise.all(entries.map(async (entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return jsonlFiles(path)
    return entry.isFile() && entry.name.endsWith('.jsonl') ? [path] : []
  }))
  return paths.flat()
}

async function readFixtureOutput(cwd: string): Promise<FixtureOutput> {
  const captures = JSON.parse(await readFile(join(cwd, 'otlp-captures.json'), 'utf8')) as OtlpCapture[]
  const logs = await jsonlFiles(join(cwd, '.sessions'))
  expect(logs).toHaveLength(1)
  return { captures, logContent: await readFile(logs[0] as string, 'utf8') }
}

describe('removed session upload through the production headless profile', () => {
  it.each(['FEEDBACK_ONLY', 'DISABLED'])('retains feedback locally without uploads for legacy mode %s', async (mode) => {
    let output!: FixtureOutput
    const { stderr } = await runLoaderSmoke({
      label: 'local-only feedback', tempDirPrefix: 'telemetry-removed-e2e-',
      binScript: driver, libBinScript: driver, configPath,
      tsconfigPath: repoTsconfig, env: { DSH_TELEMETRY_E2E_MODE: mode },
      inspect: async (cwd) => { output = await readFixtureOutput(cwd) },
    })
    expect(stderr).not.toContain('UNHANDLED')
    expect(output.captures).toEqual([])
    expect(output.logContent).toContain(FIXTURE_SECRET)
    expect(output.logContent).toContain('feedback/record')
  }, LOADER_SMOKE_TEST_TIMEOUT_MS)
})
