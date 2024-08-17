import { effect } from '../../src/effect';

jest.useFakeTimers();

describe('effect', () => {
  it('the callback should be called just when "first" property change.', () => {
    const obj: Record<string, any> = {
      first: 1,
      second: 2,
      third: 3,
    };

    const callback = jest.fn();
    effect(obj, callback, 'first');

    obj.first = 'first';
    obj.second = 'second';
    obj.third = 'third';

    jest.runOnlyPendingTimers();

    expect(callback).toBeCalledTimes(1);
    expect(JSON.stringify(callback.mock.calls[0][0])).toBe(JSON.stringify({ newValues: { first: 'first' }, oldValues: { first: 1 } }));
    expect(obj.first).toBe('first');
    expect(obj.second).toBe('second');
    expect(obj.third).toBe('third');
  });

  it('the callback should not be called just when "first" property change.', () => {
    const obj: Record<string, any> = {
      first: 1,
      second: 2,
      third: 3,
    };

    const callback = jest.fn();
    effect(obj, callback, 'first');

    obj.first = 1;
    obj.second = 'second';
    obj.third = 'third';

    jest.runOnlyPendingTimers();

    expect(callback).toBeCalledTimes(0);
    expect(obj.first).toBe(1);
    expect(obj.second).toBe('second');
    expect(obj.third).toBe('third');
  });

  it('the cb1 should be called 1 time and cb2 2 times.', () => {
    const obj: Record<string, any> = {
      first: 1,
      second: 2,
      third: 3,
    };

    const cb1 = jest.fn();
    effect(obj, cb1, 'first');

    const cb2 = jest.fn();
    effect(obj, cb2);

    obj.first = 'first';
    obj.second = 'second';

    jest.runOnlyPendingTimers();

    expect(cb1).toBeCalledTimes(1);
    expect(cb2).toBeCalledTimes(2);
  });

  it('the callback should called just when "first" and "second" properties change.', async () => {
    const obj: Record<string, any> = {
      first: 1,
      second: 2,
      third: 3,
    };

    const callback = jest.fn();
    effect(obj, callback, 'first', 'second');

    obj.first = 'first';
    obj.second = 'second';
    obj.third = 'third';

    jest.runOnlyPendingTimers();

    expect(callback).toBeCalledTimes(2);
    expect(obj.first).toBe('first');
    expect(obj.second).toBe('second');
    expect(obj.third).toBe('third');
  });

  it('the callback should called for any property change.', () => {
    const obj: Record<string, any> = {
      first: 1,
      second: 2,
      third: 3,
    };
    
    const callback = jest.fn();
    effect(obj, callback);

    obj.first = 'first';
    obj.second = 'second';
    obj.third = 'third';

    jest.runOnlyPendingTimers();

    expect(callback).toBeCalledTimes(3);
    expect(obj.first).toBe('first');
    expect(obj.second).toBe('second');
    expect(obj.third).toBe('third');
  });
});
