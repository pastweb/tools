import { describe, it, expect, vi } from 'vitest';
import { throttle } from '../../src';

// Tell Vitest to mock all timeout functions
vi.useFakeTimers();

describe('given the throttle function', () => {
  it('given throttled, when called 100x then advance 1000, then original called once', () => {
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

  it('given throttled, when burst advance2000 burst, then called twice', () => {
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

  it('given throttled burst, cancel, advance, burst, then called once (second prevented by cancel)', () => {
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

  it('given throttled burst cancel advance burst flush advance burst, then called twice total', () => {
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
