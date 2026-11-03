import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import DeepSeekLlmApiExtensionRegistry from '@deepseek-ai/dsh-deepseek-llm-api-extensions'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { recordFeedback } from '@deepseek-ai/dsh-command-feedback'
import * as SessionLogDeepSeek from '../src/index.ts'

const contexts: Context[] = []
afterEach(async () => { await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose())) })

describe('removed DeepSeek Session-log contribution', () => {
  it.each([undefined, false, true])('does not prepare history with legacy enabled=%s', async (enabled) => {
    const ctx = new Context()
    contexts.push(ctx)
    await ctx.plugin(SessionStore)
    await ctx.plugin(DeepSeekLlmApiExtensionRegistry)
    const plugin = await ctx.plugin(SessionLogDeepSeek, enabled === undefined ? {} : { enabled })
    const session = ctx.sessions.create(SessionId('local-history'), { meta: { cwd: '/private/workspace' } })
    session.append('user/message', createUserMessage({
      content: [{ type: 'text', text: 'private local history' }], source: { kind: 'user' },
    }), { surfaceOp: 'append' })
    recordFeedback(session, { text: 'private feedback' })
    const history = session.snapshotEvents()
    const exclusion = vi.fn(() => false)
    const dispose = ctx.sessionLogDeepSeek.registerExclusion(exclusion)
    for (const purpose of [undefined, 'session-title', 'compaction']) {
      const prepared = await ctx.deepseekLlmApiExtensions.prepare({
        body: { messages: [] }, signal: new AbortController().signal, sessionId: session.id,
        ...purpose === undefined ? {} : { purpose },
      })
      expect(prepared.fields).not.toHaveProperty('dsh_session_log')
      await prepared.accept()
    }
    expect(exclusion).not.toHaveBeenCalled()
    expect(session.snapshotEvents()).toEqual(history)
    expect(SessionLogDeepSeek.acceptedThrough(session)).toBe(-1)
    await dispose()
    await dispose()
    await plugin.dispose()
  })
})
