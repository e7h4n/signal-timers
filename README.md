# AbortSignal Enhanced Timers Library

[![Coverage Status](https://coveralls.io/repos/github/e7h4n/signal-timers/badge.svg?branch=coveralls)](https://coveralls.io/github/e7h4n/signal-timers?branch=coveralls) ![NPM Version](https://img.shields.io/npm/v/signal-timers)

A TypeScript library that provides enhanced timer functions with AbortSignal support, allowing for more flexible asynchronous operations.

## Features

- **Signal Aware Interval**: Repeatedly execute a callback at specified intervals until an AbortSignal is aborted.
- **Signal Aware Timeout**: Delay the execution of a callback until either the specified time has elapsed or the AbortSignal is triggered. If the AbortSignal is not triggered, the callback will execute after the delay.
- **Signal Aware Delay**: Create a promise that resolves after a specified time or rejects when an AbortSignal is aborted.

## Installation

Install the library using npm or yarn:

```bash
npm install signal-timers
# or
yarn add signal-timers
```

## Usage

### Importing

You can import the functions individually or all at once:

```typescript
import { interval, timeout, delay, animationFrame } from 'signal-timers';
```

### interval

Create an interval timer that can be aborted with an AbortSignal.

```typescript
const callback = () => {
  console.log('Interval callback');
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
timeout(() => {
  console.log('Timeout callback');
}, 5000, { signal: controller.signal });

// To abort the timeout
controller.abort();
```

### delay

Create a promise-based delay that can be aborted with an AbortSignal.

```typescript
await delay(5000, { signal: AbortSignal.timeout(1000) })

// This line of code will not execute; the preceding line will be rejected after 1000ms, throwing an AbortError.
```

### animationFrame

Set a animation frame callback that can be aborted with an AbortSignal.

```typescript
const controller = new AbortController();
animationFrame(() => {
  console.log('animation callback');
}, { signal: controller.signal });

// To abort the timeout
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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.