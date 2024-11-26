/* eslint-disable @typescript-eslint/no-invalid-void-type */
class AbortError extends Error {
    constructor(message?: string) {
        super(message)

        this.name = 'AbortError'
    }
}

function promiseFromSignal(signal?: AbortSignal) {
    return new Promise((_, reject) => {
        signal?.addEventListener('abort', () => {
            reject(new AbortError(signal.reason as (string | undefined)))
        })
    })
}

interface TimerOptions {
    signal?: AbortSignal
}

/**
 * Create an interval timer that can be aborted with an AbortSignal.
 *
 * ```typescript
 * const callback = () => {
 *   console.log('Interval callback');
 * };
 *
 * const controller = new AbortController();
 * interval(callback, 1000, { signal: controller.signal });
 *
 * // To abort the interval
 * controller.abort();
 * ```
 *
 * @param callback The callback function to execute.
 * @param ms The interval time in milliseconds.
 * @param options An optional AbortSignal to abort the interval.
 */
export function interval(callback: (args: void) => void, ms?: number, options?: TimerOptions) {
    options?.signal?.throwIfAborted()

    const timer = setInterval(callback, ms);
    options?.signal?.addEventListener('abort', () => { clearInterval(timer) })
}

/**
 * Set a timeout timer that can be aborted with an AbortSignal.
 *
 * ```typescript
 * const controller = new AbortController();
 * timeout(() => {
 *   console.log('Timeout callback');
 * }, 5000, { signal: controller.signal });
 *
 * // To abort the timeout
 * controller.abort();
 * ```
 *
 * @param callback The callback function to execute after the timeout.
 * @param ms The timeout duration in milliseconds.
 * @param options An optional AbortSignal to abort the timeout.
 */
export function timeout(callback: (args: void) => void, ms?: number, options?: TimerOptions) {
    options?.signal?.throwIfAborted()

    function onAbort() {
        clearTimeout(timer)
    }

    const timer = setTimeout(function (...args: unknown[]) {
        options?.signal?.removeEventListener('abort', onAbort)

        if (callback instanceof Function) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
            (callback as any)(...args)
        } else {
            // eslint-disable-next-line @typescript-eslint/no-implied-eval
            new Function(callback)(...args)
        }
    }, ms);

    options?.signal?.addEventListener('abort', onAbort)
}

export function microtask(callback: () => unknown, options?: TimerOptions) {
    queueMicrotask(function () {
        if (options?.signal?.aborted) {
            return
        }

        callback()
    });
}

/**
 * Create a promise-based delay that can be aborted with an AbortSignal.
 *
 * ```typescript
 * await delay(5000, { signal: AbortSignal.timeout(1000) })
 *
 * // This line of code will not execute; the preceding line will be rejected after 1000ms, throwing an AbortError.
 * ```
 *
 * @param ms The delay time in milliseconds.
 * @param options An optional AbortSignal to abort the delay.
 * @returns a promise resolved after ms.
 */
export function delay(ms: number, options?: TimerOptions): Promise<void> {
    return Promise.race([new Promise<void>(function (resolve) {
        timeout(function () {
            resolve()
        }, ms, options)
    }), promiseFromSignal(options?.signal)]) as Promise<void>
}

/**
 * Set a animation frame callback that can be aborted with an AbortSignal.
 *
 * ```typescript
 * const controller = new AbortController();
 * animationFrame(() => {
 *   console.log('animation callback');
 * }, { signal: controller.signal });
 *
 * // To abort the timeout
 * controller.abort();
 * ```
 *
 * @param callback The callback function to execute in next animation frame.
 * @param options An optional AbortSignal to abort the animation frame callback.
 */
export function animationFrame(callback: FrameRequestCallback, options?: TimerOptions) {
    options?.signal?.throwIfAborted()

    function onAbort() {
        cancelAnimationFrame(timer)
    }

    const timer = requestAnimationFrame(function (...args) {
        options?.signal?.removeEventListener('abort', onAbort)
        callback(...args)
    });

    options?.signal?.addEventListener('abort', onAbort)
}

/**
 * Set a microtask callback that can be aborted with an AbortSignal.
 * 
 * @param callback The callback function to execute in next microtask.
 * @param options An optional AbortSignal to abort the microtask callback.
 */
export function delayToNextMicrotask(options?: TimerOptions): Promise<void> {
    return Promise.race([new Promise<void>(function (resolve) {
        queueMicrotask(function () {
            resolve()
        })
    }), promiseFromSignal(options?.signal)]) as Promise<void>
}
