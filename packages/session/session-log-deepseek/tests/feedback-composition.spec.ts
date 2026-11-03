import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import * as JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import MessageFeedback from '@deepseek-ai/dsh-message-feedback'
import { recordFeedback } from '@deepseek-ai/dsh-command-feedback'
import LlmRuntime, { createAssistantMessage, createUserMessage } from '@deepseek-ai/dsh-llm'
import * as LlmDeepSeek from '@deepseek-ai/dsh-llm-deepseek-api-key'
import DeepSeekLlmApiExtensions from '@deepseek-ai/dsh-deepseek-llm-api-extensions'
import { startMockLlmServer, type MockLlmServer, type MockLlmServerOptions } from '@deepseek-ai/dsh-llm-mock-server'
import * as SessionLogDeepSeek from '../src/index.ts'

let root: string | undefined
let ctx: Context | undefined
let server: MockLlmServer | undefined

afterEach(async () => {
  await ctx?.fiber.dispose()
  await server?.close()
  if (root !== undefined) await rm(root, { recursive: true, force: true })
  ctx = undefined
  server = undefined
  root = undefined
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

/** Boot the official upload route through the Loader with one session-log configuration. */
async function boot(
  sessionLog: { enabled: boolean; maxBytes?: number }, mock: MockLlmServerOptions,
): Promise<{ ctx: Context; server: MockLlmServer }> {
  root = await mkdtemp(join(tmpdir(), 'dsh-feedback-upload-'))
  vi.stubEnv('DSH_HOME', root)
  vi.stubEnv('DEEPSEEK_API_KEY', 'feedback-test-key')
  server = await startMockLlmServer(mock)
  const modules = new Map<string, unknown>([
    ['@deepseek-ai/dsh-session', SessionStore],
    ['@deepseek-ai/dsh-session-persistence-jsonl', JsonlSessionPersistence],
    ['@deepseek-ai/dsh-message-feedback', MessageFeedback],
    ['@deepseek-ai/dsh-llm', LlmRuntime],
    ['@deepseek-ai/dsh-llm-deepseek-api-key', LlmDeepSeek],
    ['@deepseek-ai/dsh-deepseek-llm-api-extensions', DeepSeekLlmApiExtensions],
    ['@deepseek-ai/dsh-session-log-deepseek', SessionLogDeepSeek],
  ])
  const config = join(root, 'cordis.yml')
  await writeFile(config, JSON.stringify([...modules.keys()].map(name => ({
    name,
    ...name === '@deepseek-ai/dsh-session-persistence-jsonl'
      ? { config: { root: join(root!, 'sessions'), compression: 'none' } }
      : name === '@deepseek-ai/dsh-message-feedback'
        ? { config: { maxNoteBytes: 1024 } }
        : name === '@deepseek-ai/dsh-llm-deepseek-api-key'
          ? { config: { baseURL: server!.baseURL } }
          : name === '@deepseek-ai/dsh-session-log-deepseek'
            ? { config: sessionLog }
            : {},
  }))))
  ctx = new Context()
  ctx.baseUrl = pathToFileURL(root).href + '/'
  await ctx.plugin(Loader)
  ctx.loader.builtins.include = Include
  ctx.loader.internal = {
    version: 'v2',
    async import(specifier: string) {
      if (!modules.has(specifier)) throw new Error(`unexpected Loader import: ${specifier}`)
      return modules.get(specifier)
    },
  } as unknown as NonNullable<typeof ctx.loader.internal>
  await ctx.loader.create({ name: 'cordis:include', config: { path: pathToFileURL(config).href } })
  await ctx.loader.await()
  expect([...ctx.loader.entries()].filter(entry => entry.fiber === undefined && !entry.disabled)).toEqual([])
  return { ctx, server }
}

it('keeps feedback local after switching a locally recorded Session to the official route', async () => {
  const { ctx, server } = await boot({ enabled: true }, { sequence: ['success', 'success'] })
  const session = ctx.sessions.create(SessionId('feedback-local-only'))
  const handle = await ctx.sessionPersistence.create(session.header)
  try {
    session.append('turn/start', { turn: 1 })
    session.append('step/start', { turn: 1, step: 1 })
    session.append('request/header', { reason: 'initial', header: { config: { provider: 'local', model: 'local-model' } } })
    const user = createUserMessage({ content: [{ type: 'text', text: 'Question' }], source: { kind: 'user' } })
    const assistant = createAssistantMessage({ content: [{ type: 'text', text: 'Answer' }], source: { provider: 'local', model: 'local-model' } })
    session.append('user/message', user, { surfaceOp: 'append' })
    session.append('assistant/message', { message: assistant, stream: [], turn: 1, step: 1 }, { surfaceOp: 'append' })
    session.append('step/end', { turn: 1, step: 1 })
    session.append('turn/end', { turn: 1, reason: { kind: 'completed' } })
    recordFeedback(session, { text: 'Private local feedback' })
    const created = await ctx.messageFeedback.put({ sessionId: session.id, messageId: assistant.id, rating: 'negative', note: 'Private note', ifVersion: null })
    if (!created.ok) throw new Error(created.error.code)
    const request = async () => {
      const chunks = []
      for await (const chunk of ctx.llm.stream({ provider: 'deepseek-official', model: 'deepseek-v4-flash', sessionId: session.id, messages: session.deriveMessages(), signal: AbortSignal.timeout(3000) })) chunks.push(chunk)
      expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'stop' } })
    }
    await request()
    expect(await ctx.messageFeedback.delete({ sessionId: session.id, messageId: assistant.id, ifVersion: created.value.version }))
      .toEqual({ ok: true, value: { absent: true } })
    await request()
    expect(server.requests).toHaveLength(2)
    for (const wire of server.requests) {
      expect(wire.path).toBe('/v1/messages')
      expect(wire.body).not.toHaveProperty('dsh_session_log')
      expect(JSON.stringify(wire.body)).not.toMatch(/Private local feedback|Private note/)
      expect(wire.body).toMatchObject({ model: 'deepseek-v4-flash', messages: [
        { role: 'user', content: [{ type: 'text', text: 'Question' }] },
        { role: 'assistant', content: [{ type: 'text', text: 'Answer' }] },
      ] })
    }
    expect(SessionLogDeepSeek.acceptedThrough(session)).toBe(-1)
    await ctx.sessions.flush(session)
    const persisted = (await handle.read()).events
    expect(persisted).toEqual(session.snapshotEvents())
    expect(persisted.map(event => event.type)).toContain('feedback/record')
    expect(persisted.map(event => event.type)).toContain('feedback/message-delete')
  } finally { await handle.close() }
})
