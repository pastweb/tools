import { describe, it, expect, vi } from 'vitest';
import { debounce } from '../../src/debounce';

// Tell Jest to mock all timeout functions
vi.useFakeTimers();

describe('debounce', () => {
  it('execute just once', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 1000);

    for (let i = 0; i < 100; i++) {
      debouncedFunc();
    }

    // Fast-forward time
    vi.runAllTimers();

    expect(func).toBeCalledTimes(1);
  });

  it('canceled execution', () => {
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

  it('execute twice', () => {
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
