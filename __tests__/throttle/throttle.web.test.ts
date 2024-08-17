import { throttle } from '../../src';

// Tell Jest to mock all timeout functions
jest.useFakeTimers();

describe('throttle', () => {
  it('execute just once', () => {
    const func = jest.fn();
    const throttledFunc = throttle(func, 1000);

    for (let i = 0; i < 100; i++) {
      throttledFunc();
    }

    // Fast-forward until all timers have been executed
    jest.advanceTimersByTime(1000);

    // Now our callback should have been called!
    expect(func).toBeCalled();
    expect(func).toHaveBeenCalledTimes(1);

    expect(func).toBeCalledTimes(1);
  });

  it('execute twice', () => {
    const func = jest.fn();
    const throttledFunc = throttle(func, 1000);

    for (let i = 0; i < 100; i++) {
      throttledFunc();
    }

    // Fast-forward until all timers have been executed
    jest.advanceTimersByTime(2000);

    for (let i = 0; i < 100; i++) {
      throttledFunc();
    }

    // Now our callback should have been called!
    expect(func).toBeCalled();
    expect(func).toHaveBeenCalledTimes(2);

    expect(func).toBeCalledTimes(2);
  });

  it('execute not be executed the second time', () => {
    const func = jest.fn();
    const throttledFunc = throttle(func, 1000);

    for (let i = 0; i < 100; i++) {
      throttledFunc();
    }

    (throttledFunc as any).cancel();

    // Fast-forward until all timers have been executed
    jest.advanceTimersByTime(2000);

    for (let i = 0; i < 100; i++) {
      throttledFunc();
    }

    // Now our callback should have been called!
    expect(func).toHaveBeenCalledTimes(1);

    expect(func).toBeCalledTimes(1);
  });

  it('execute to be executed the third time', () => {
    const func = jest.fn();
    const throttledFunc = throttle(func, 1000);

    for (let i = 0; i < 100; i++) {
      throttledFunc();
    }

    (throttledFunc as any).cancel();

    // Fast-forward until all timers have been executed
    jest.advanceTimersByTime(2000);

    for (let i = 0; i < 100; i++) {
      throttledFunc();
    }

    (throttledFunc as any).flush();

    // Fast-forward until all timers have been executed
    jest.advanceTimersByTime(3000);

    for (let i = 0; i < 100; i++) {
      throttledFunc();
    }

    // Now our callback should have been called!
    expect(func).toHaveBeenCalledTimes(2);

    expect(func).toBeCalledTimes(2);
  });
});
