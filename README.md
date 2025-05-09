# AbortSignal Enhanced Timers Library

![NPM Type Definitions](https://img.shields.io/npm/types/signal-timers)
![NPM Version](https://img.shields.io/npm/v/signal-timers)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/signal-timers)
[![CI](https://github.com/e7h4n/signal-timers/actions/workflows/ci.yaml/badge.svg)](https://github.com/e7h4n/signal-timers/actions/workflows/ci.yaml)
[![Coverage Status](https://coveralls.io/repos/github/e7h4n/signal-timers/badge.svg?branch=main)](https://coveralls.io/github/e7h4n/signal-timers?branch=main)
[![Maintainability](https://api.codeclimate.com/v1/badges/a0b68839fea9c990a3eb/maintainability)](https://codeclimate.com/github/e7h4n/signal-timers/maintainability)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript library that provides enhanced timer functions with AbortSignal support, allowing for more flexible asynchronous operations.

## Features

This open-source library offers signal-aware control for timing functions. It allows you to execute callbacks at regular intervals, delay their execution, or create promises that resolve after a set time. All actions can be interrupted by an AbortSignal, providing flexible and responsive time management in your code.

## Installation

Install the library using npm or yarn:

```bash
npm install signal-timers

# or

yarn add signal-timers
````

## Usage

### Importing

You can import the functions individually or all at once:

```typescript
import { interval, timeout, delay, animationFrame } from 'signal-timers';
````

### interval

Create an interval timer that can be aborted with an AbortSignal.

```typescript
const callback = () => {
  console.log("Interval callback");
};

const controller = new AbortController();
interval(callback, 1000, { signal: controller.signal });

// To abort the interval
controller.abort();
```

### timeout

Set a timeout timer that can be aborted with an AbortSignal.

```typescript
const controller = new AbortController();
timeout(
  () => {
    console.log("Timeout callback");
  },
  5000,
  { signal: controller.signal }
);

// To abort the timeout
controller.abort();
```

### delay

Create a promise-based delay that can be aborted with an AbortSignal.

```typescript
await delay(5000, { signal: AbortSignal.timeout(1000) });

// This line of code will not execute; the preceding line will be rejected after 1000ms, throwing an AbortError.
```

### animationFrame

Set a animation frame callback that can be aborted with an AbortSignal.

```typescript
const controller = new AbortController();
animationFrame(
  () => {
    console.log("animation callback");
  },
  { signal: controller.signal }
);

// To abort the timeout
controller.abort();
```

### microtask

Set a microtask callback that can be aborted with an AbortSignal.

```typescript
const controller = new AbortController();
microtask(
  () => {
    console.log("microtask callback");
  },
  { signal: controller.signal }
);

// or using Promise style
await delayToNextMicrotask({ signal: controller.signal });

// To abort the microtask
controller.abort();
```

## API

### `interval(callback, ms, options?)`

- **callback**: The callback function to execute.
- **ms**: The interval time in milliseconds.
- **options.signal**: An optional AbortSignal to abort the interval.

### `timeout(callback, ms, options?)`

- **callback**: The callback function to execute after the timeout.
- **ms**: The timeout duration in milliseconds.
- **options.signal**: An optional AbortSignal to abort the timeout.

### `animationFrame(callback, options?)`

- **callback**: The callback function to execute in next animation frame.
- **options.signal**: An optional AbortSignal to abort the animation frame callback.

### `delay(ms, options?)`

- **ms**: The delay time in milliseconds.
- **options.signal**: An optional AbortSignal to abort the delay.

### `delayToNextMicrotask(options?)`

- **options.signal**: An optional AbortSignal to abort the delay.

### `microtask(callback, options?)`

- **callback**: The callback function to execute.
- **options.signal**: An optional AbortSignal to abort the microtask.

## FAQ

### Why not return timer id from `timeout` and `interval`?

Using the return value from timeout/interval methods to cancel timers is a technique from before AbortSignal existed. Once you've decided to use AbortSignal, using timerId is no longer appropriate. It can also cause confusion - for example, if the timer is already executing, clearTimeout cannot prevent asynchronous code in the callback from running. Therefore, `signal-timers` chooses not to return a timerId. If you find yourself needing to use the timerId approach, you can try code like this:

```typescript
function myTimeout(callback, ms, { signal }) {
  const ctrl = new AbortController();
  timeout(callback, ms, { signal: AbortSignal.any(signal, ctrl.signal) });
  return () => {
    ctrl.abort();
  };
}

const clearTimer = myTimeout(
  () => {
    // ...
  },
  1000,
  { signal }
);

// ...
clearTimer();
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
