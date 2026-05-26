import { describe, it, expect, vi } from 'vitest';
import { throttle } from '../../src';

// Tell Vitest to mock all timeout functions
vi.useFakeTimers();

describe('throttle', () => {
  it('execute just once', () => {
    const func = vi.fn();
    const throttledFunc = throttle(func, 1000);

    for (let i = 0; i < 100; i++) {
      throttledFunc();
    }

    // Fast-forward until all timers have been executed
    vi.advanceTimersByTime(1000);

    // Now our callback should have been called!
    expect(func).toBeCalled();
    expect(func).toHaveBeenCalledTimes(1);

    expect(func).toBeCalledTimes(1);
  });

  it('execute twice', () => {
    const func = vi.fn();
    const throttledFunc = throttle(func, 1000);

    for (let i = 0; i < 100; i++) {
      throttledFunc();
    }

    // Fast-forward until all timers have been executed
    vi.advanceTimersByTime(2000);

    for (let i = 0; i < 100; i++) {
      throttledFunc();
    }

    // Now our callback should have been called!
    expect(func).toBeCalled();
    expect(func).toHaveBeenCalledTimes(2);

    expect(func).toBeCalledTimes(2);
  });

  it('execute not be executed the second time', () => {
    const func = vi.fn();
    const throttledFunc = throttle(func, 1000);

    for (let i = 0; i < 100; i++) {
      throttledFunc();
    }

    (throttledFunc as any).cancel();

    // Fast-forward until all timers have been executed
    vi.advanceTimersByTime(2000);

    for (let i = 0; i < 100; i++) {
      throttledFunc();
    }

    // Now our callback should have been called!
    expect(func).toHaveBeenCalledTimes(1);

    expect(func).toBeCalledTimes(1);
  });

  it('execute to be executed the third time', () => {
    const func = vi.fn();
    const throttledFunc = throttle(func, 1000);

    for (let i = 0; i < 100; i++) {
      throttledFunc();
    }

    (throttledFunc as any).cancel();

    // Fast-forward until all timers have been executed
    vi.advanceTimersByTime(2000);

    for (let i = 0; i < 100; i++) {
      throttledFunc();
    }

    (throttledFunc as any).flush();

    // Fast-forward until all timers have been executed
    vi.advanceTimersByTime(3000);

    for (let i = 0; i < 100; i++) {
      throttledFunc();
    }

    // Now our callback should have been called!
    expect(func).toHaveBeenCalledTimes(2);

    expect(func).toBeCalledTimes(2);
  });
});
