// @vitest-environment node
import { getEventListeners, setMaxListeners } from 'node:events'
import { getActiveResourcesInfo } from 'node:process'
import { describe, expect, test, vi } from 'vitest'
import { delay, delayToNextMicrotask } from '../'

describe.each([
    { name: 'delay', wait: (signal: AbortSignal) => delay(0, { signal }) },
    { name: 'delayToNextMicrotask', wait: (signal: AbortSignal) => delayToNextMicrotask({ signal }) },
])('$name listener cleanup', ({ wait }) => {
    test('does not accumulate abort listeners on a long-lived signal', async () => {
        const { signal } = new AbortController()
        // Keep a regression from flooding the output with listener warnings.
        setMaxListeners(0, signal)

        for (let iteration = 0; iteration < 404; iteration++) {
            await wait(signal)
        }

        expect(signal.aborted).toBe(false)
        expect(getEventListeners(signal, 'abort')).toHaveLength(0)
    })

    test('removes its listener when aborted and preserves the AbortError', async () => {
        const controller = new AbortController()
        const reason = new Error('cancelled')
        const pending = wait(controller.signal)

        controller.abort(reason)

        await expect(pending).rejects.toMatchObject({
            name: 'AbortError',
            message: String(reason),
        })
        expect(getEventListeners(controller.signal, 'abort')).toHaveLength(0)
    })

    test('preserves unrelated abort listeners after completion', async () => {
        const controller = new AbortController()
        const onAbort = vi.fn()
        controller.signal.addEventListener('abort', onAbort, { once: true })

        await wait(controller.signal)

        expect(getEventListeners(controller.signal, 'abort')).toEqual([onAbort])
        controller.abort()
        expect(onAbort).toHaveBeenCalledOnce()
    })
})

describe('delay cancellation and scheduling', () => {
    test('rejects an already-aborted signal with its original reason without adding listeners', async () => {
        const reason = new Error('already cancelled')
        const signal = AbortSignal.abort(reason)

        await expect(delay(0, { signal })).rejects.toBe(reason)

        expect(getEventListeners(signal, 'abort')).toHaveLength(0)
    })

    test('cancels the pending timer when aborted', async () => {
        const controller = new AbortController()
        const timersBefore = getActiveResourcesInfo().filter(resource => resource === 'Timeout').length
        const pending = delay(60_000, { signal: controller.signal })

        controller.abort()
        const timersAfter = getActiveResourcesInfo().filter(resource => resource === 'Timeout').length

        await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
        expect(timersAfter).toBe(timersBefore)
    })

    test('still yields to timers when called with zero milliseconds and no signal', async () => {
        const trace: string[] = []
        const earlierTimer = new Promise<void>((resolve) => {
            setTimeout(() => {
                trace.push('earlier timer')
                resolve()
            }, 0)
        })

        await delay(0)
        trace.push('delay')
        await earlierTimer

        expect(trace).toEqual(['earlier timer', 'delay'])
    })
})
