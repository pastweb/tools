import { describe, it, expect, vi } from 'vitest';
import { debounce } from '../../src/debounce';

// Tell Jest to mock all timeout functions
vi.useFakeTimers();

describe('given the debounce function', () => {
  it('given a debounced fn, when called 100 times rapidly, then after runAllTimers the original is called exactly once', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 1000);

    for (let i = 0; i < 100; i++) {
      debouncedFunc();
    }

    // Fast-forward time
    vi.runAllTimers();

    expect(func).toBeCalledTimes(1);
  });

  it('given a debounced fn that is canceled before calls, when called 100x, then original called 0 times after timers', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 1000);
    
    (debouncedFunc as any).cancel();

    for (let i = 0; i < 100; i++) {
      debouncedFunc();
    }

    // Fast-forward time
    vi.runAllTimers();

    expect(func).toBeCalledTimes(0);
  });

  it('given debounced, when burst, cancel, burst, flush, burst, then original called twice total after advances', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 1000);

    for (let i = 0; i < 100; i++) {
      debouncedFunc();
    }

    (debouncedFunc as any).cancel();

    // Fast-forward until all timers have been executed
    vi.advanceTimersByTime(2000);

    for (let i = 0; i < 100; i++) {
      debouncedFunc();
    }

    (debouncedFunc as any).flush();

    // Fast-forward until all timers have been executed
    vi.advanceTimersByTime(3000);

    for (let i = 0; i < 100; i++) {
      debouncedFunc();
    }

    expect(func).toBeCalledTimes(2);
  });
});
