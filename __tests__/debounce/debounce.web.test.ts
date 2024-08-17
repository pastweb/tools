import { debounce } from '../../src/debounce';

// Tell Jest to mock all timeout functions
jest.useFakeTimers();

describe('debounce', () => {
  it('execute just once', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 1000);

    for (let i = 0; i < 100; i++) {
      debouncedFunc();
    }

    // Fast-forward time
    jest.runAllTimers();

    expect(func).toBeCalledTimes(1);
  });

  it('canceled execution', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 1000);
    
    (debouncedFunc as any).cancel();

    for (let i = 0; i < 100; i++) {
      debouncedFunc();
    }

    // Fast-forward time
    jest.runAllTimers();

    expect(func).toBeCalledTimes(0);
  });

  it('execute twice', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 1000);

    for (let i = 0; i < 100; i++) {
      debouncedFunc();
    }

    (debouncedFunc as any).cancel();

    // Fast-forward until all timers have been executed
    jest.advanceTimersByTime(2000);

    for (let i = 0; i < 100; i++) {
      debouncedFunc();
    }

    (debouncedFunc as any).flush();

    // Fast-forward until all timers have been executed
    jest.advanceTimersByTime(3000);

    for (let i = 0; i < 100; i++) {
      debouncedFunc();
    }

    expect(func).toBeCalledTimes(2);
  });
});
