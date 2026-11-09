/** Browser model requests never attach retired Session-log uploads. */
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'
import { expect, it, onTestFinished } from 'vitest'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import { startMockLlmServer } from '@deepseek-ai/dsh-llm-mock-server'
import { launchWebScaffold, webSnapshotMode } from './scaffold.ts'
import { connectFreshWorkspace, newEnglishPage, openSettings } from './support.ts'

it.skipIf(webSnapshotMode() === 'record')('omits session history across reloads despite a legacy enabled profile', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-upload-browser-'))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  const server = await startMockLlmServer({ sequence: ['success', 'success'], successText: 'UPLOAD_SETTING_DONE' })
  onTestFinished(() => server.close())
  const key = credentialRef('DSH_UPLOAD_BROWSER_KEY')
  const overlay = join(root, 'upload.yml')
  await writeFile(overlay, JSON.stringify([
    { id: 'llm-deepseek', config: { baseURL: server.baseURL, apiKeyEnv: key } },
    { id: 'session-log-deepseek', config: { enabled: true } },
    { id: 'agent-default-model', config: { provider: 'deepseek-official', model: 'deepseek-v4-flash' } },
  ]))
  const scaffold = await launchWebScaffold({ deepSeekMissingCredential: true, extraOverlayPath: overlay })
  onTestFinished(() => scaffold.close())
  await scaffold.ctx.credentials.set(key, 'upload-browser-test-key')
  const browser = await chromium.launch()
  onTestFinished(() => browser.close())
  const page = await newEnglishPage(browser)
  await page.goto(scaffold.authenticatedUrl)
  await connectFreshWorkspace(page, scaffold.workspaceCwd)
  const input = page.locator('[data-composer-input]').first()
  const send = async (text: string) => {
    const settled = scaffold.whenTurnSettled()
    await input.fill(text)
    await input.press('Enter')
    return settled
  }
  const sessionId = await send('local-session-before-reload')
  expect(server.requests).toHaveLength(1)
  expect(server.requests[0]!.body).not.toHaveProperty('dsh_session_log')
  await openSettings(page, 'en')
  await expect.poll(() => page.getByRole('switch', { name: 'Upload Session Log when using the official model API' }).count()).toBe(0)
  await page.keyboard.press('Escape')
  await page.reload()
  expect(await send('local-session-after-reload')).toBe(sessionId)
  expect(server.requests).toHaveLength(2)
  expect(server.requests[1]!.body).not.toHaveProperty('dsh_session_log')
  expect(server.requests.map(request => request.outcome)).toEqual(['completed', 'completed'])
})
