import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { animationFrame, delay, delayToNextMicrotask, interval, microtask, timeout } from "../";

describe('Support for signal in interval/timeout.', () => {

    test('The interval will repeatedly execute until the signal is aborted.', async () => {
        const trace = vi.fn()
        interval(trace, 10, { signal: AbortSignal.timeout(100) })

        await delay(150)
        expect(trace).toBeCalledTimes(9)
    })

    test('The timeout can be canceled by the signal.', async () => {
        const trace = vi.fn()
        timeout(trace, 10, { signal: AbortSignal.timeout(5) })

        await delay(15)
        expect(trace).not.toBeCalled()
    })

    test('If a signal that has already been aborted is passed in, an exception will be thrown immediately.', () => {
        expect(() => { timeout(vi.fn(), 0, { signal: AbortSignal.abort() }) }).toThrow()
    })
})

describe('Support for signal in delay', () => {
    test('If the signal is not aborted, the delay can proceed normally.', async () => {
        const begin = Date.now()
        await delay(20, new AbortController())

        expect(Date.now() - begin).greaterThanOrEqual(20)
    })

    test('If aborted during the delay process, the promise will be immediately rejected.', async () => {
        await expect(delay(30, { signal: AbortSignal.timeout(10) })).rejects.toThrow()
    })
})

describe('Suupport for signal in requestAnimationFrame', () => {

    beforeEach(() => {
        vi.stubGlobal('requestAnimationFrame', (cb: Parameters<typeof requestAnimationFrame>[0]) => {
            return setTimeout(cb, 16)
        })

        vi.stubGlobal('cancelAnimationFrame', (timer: number) => {
            clearTimeout(timer)
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    test('If the signal is not aborted, the animation frame should be fired normally', async () => {
        const trace = vi.fn()
        animationFrame(trace, new AbortController())
        await delay(20)
        expect(trace).toBeCalled()
    })

    test('If the signal is aborted, the animation frame should not fire', async () => {
        const trace = vi.fn()
        animationFrame(trace, { signal: AbortSignal.timeout(10) })
        await delay(20)
        expect(trace).not.toBeCalled()
    })
})

describe('Support for signal in delayMicrotask', () => {
    test('If the signal is not aborted, the microtask can proceed normally.', async () => {
        const trace = vi.fn()
        await delayToNextMicrotask().then(trace)
        expect(trace).toBeCalled()
    })

    test('If aborted during the microtask process, the promise will be immediately rejected.', async () => {
        const controller = new AbortController()
        queueMicrotask(() => {
            controller.abort()
        })

        await expect(delayToNextMicrotask({ signal: controller.signal })).rejects.toThrow()
    })

    test('microtask should run normally without signal', async () => {
        const trace = vi.fn()
        microtask(trace)
        await delayToNextMicrotask()
        expect(trace).toBeCalled()
    })

    test('If using microtask with signal, the callback should rise a AbortError.', async () => {
        const trace = vi.fn()
        const controller = new AbortController()
        queueMicrotask(() => {
            controller.abort()
        })

        microtask(() => {
            trace()
        }, {
            signal: controller.signal
        })

        await delayToNextMicrotask()

        expect(trace).not.toBeCalled()
    })
})