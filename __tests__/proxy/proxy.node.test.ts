import { proxy } from '../../src';

jest.useFakeTimers();

describe('proxy', () => {
  it('the callback should be called just when "first" property changes.', () => {
    const target: Record<string, any> = {
      first: 1,
      second: 2,
      third: 3,
    };

    const callback = jest.fn();
    const p = proxy(target, callback, 'first');

    p.first = 'first';
    p.second = 'second';
    p.third = 'third';

    jest.runOnlyPendingTimers();

    const { newValue, oldValue, prop, action, args } = callback.mock.calls[0][0];

    expect(callback).toBeCalledTimes(1);
    expect(newValue).toBe('first');
    expect(oldValue).toBe(1);
    expect(prop).toBe('first');
    expect(action).toBe('set');
    expect(args.length).toBe(0);
    expect(target.first).toBe('first');
    expect(target.second).toBe('second');
    expect(target.third).toBe('third');
  });

  it('the callback should be called just when element [0] changes.', () => {
    const target: any[] = [1, 2, 3];

    const callback = jest.fn();
    const p = proxy(target, callback, 0);

    p[0] = 'first';
    p[1] = 'second';
    p[2] = 'third';

    jest.runOnlyPendingTimers();

    const { newValue, oldValue, prop, action, args } = callback.mock.calls[0][0];

    expect(callback).toBeCalledTimes(1);
    expect(newValue).toBe('first');
    expect(oldValue).toBe(1);
    expect(prop).toBe(0);
    expect(action).toBe('set');
    expect(args.length).toBe(0);
    expect(target[0]).toBe('first');
    expect(target[1]).toBe('second');
    expect(target[2]).toBe('third');
  });

  it('the callback should not be called just when "first" property has the same value.', () => {
    const target: Record<string, any> = {
      first: 1,
      second: 2,
      third: 3,
    };

    const callback = jest.fn();
    const p = proxy(target, callback, 'first');

    p.first = 1;
    p.second = 'second';
    p.third = 'third';

    jest.runOnlyPendingTimers();

    expect(callback).toBeCalledTimes(0);
    expect(target.first).toBe(1);
    expect(target.second).toBe('second');
    expect(target.third).toBe('third');
  });

  it('the callback should not be called just when element [0] has the same value.', () => {
    const target: any[] = [1, 2, 3];

    const callback = jest.fn();
    const p = proxy(target, callback, 0);

    p[0] = 1;
    p[1] = 'second';
    p[2] = 'third';

    jest.runOnlyPendingTimers();

    expect(callback).toBeCalledTimes(0);
    expect(target[0]).toBe(1);
    expect(target[1]).toBe('second');
    expect(target[2]).toBe('third');
  });

  it('the callback should called just when "first" and "second" properties changes.', () => {
    const target: Record<string, any> = {
      first: 1,
      second: 2,
      third: 3,
    };

    const callback = jest.fn();
    const p = proxy(target, callback, 'first', 'second');

    p.first = 'first';
    p.second = 'second';
    p.third = 'third';

    jest.runOnlyPendingTimers();

    expect(callback).toBeCalledTimes(2);
    expect(target.first).toBe('first');
    expect(target.second).toBe('second');
    expect(target.third).toBe('third');
  });

  it('the callback should called just when element [0] and element[1] changes.', () => {
    const target: any[] = [1, 2, 3];

    const callback = jest.fn();
    const p = proxy(target, callback, 0, 1);

    p[0] = 'first';
    p[1] = 'second';
    p[2] = 'third';

    jest.runOnlyPendingTimers();

    expect(callback).toBeCalledTimes(2);
    expect(target[0]).toBe('first');
    expect(target[1]).toBe('second');
    expect(target[2]).toBe('third');
  });

  it('the callback should called when any element changes.', () => {
    const target: any[] = [1, 2, 3];
    
    const callback = jest.fn();
    const p = proxy(target, callback);

    p[0] = 'first';
    p[1] = 'second';
    p[2] = 'third';

    jest.runOnlyPendingTimers();

    expect(callback).toBeCalledTimes(3);
    expect(target[0]).toBe('first');
    expect(target[1]).toBe('second');
    expect(target[2]).toBe('third');
  });

  it('the callback should called when any element is get.', () => {
    const target: any[] = [1, 2, 3];
    
    const callback = jest.fn();
    const p = proxy(target, callback);

    p.push(10);
    jest.runOnlyPendingTimers();

    const { prop, action, args } = callback.mock.calls[0][0];

    expect(callback).toBeCalledTimes(1);
    expect(prop).toBe('push');
    expect(action).toBe('get');
    expect(args[0]).toBe(10);
    expect(target.length).toBe(4);
    expect(target[3]).toBe(10)
  });
});
