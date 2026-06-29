import { describe, it, expect, vi } from 'vitest';
import { createEventEmitter } from '../../src/createEventEmitter';
import { RemoveListener } from '../../src/createEventEmitter/types';
import { isObject } from '../../src/isObject';

const functions: { [key: string]: any } = {
  first: vi.fn(),
  second: vi.fn()
};

const events: { [key: string]: string } = {
  first: 'FIRST_EVENT',
  second: 'SECOND_EVENT'
};

function getEmitter(funcName = 'first') {
  const emitter = createEventEmitter();
  const subscription: RemoveListener = emitter.on(
    events[funcName],
    functions[funcName]
  );
  const spy = vi.spyOn(functions, 'first');

  return { emitter, subscription, spy };
}

describe('given the createEventEmitter factory', () => {
  it('given a created emitter, when on is called to register an event, then it returns a defined subscription object that is an object', () => {
    const { subscription } = getEmitter();
    expect(subscription).toBeDefined();
    expect(isObject(subscription)).toBe(true);
  });

  it('given a subscription from on(), then the RemoveListener subscription has eventCallbackKey and removeListener properties', () => {
    const { subscription } = getEmitter();
    expect(subscription.hasOwnProperty('eventCallbackKey')).toBe(true);
    expect(subscription.hasOwnProperty('removeListener')).toBe(true);
  });

  it('given a subscription, then its eventCallbackKey is a symbol', () => {
    const { subscription } = getEmitter();
    expect(typeof subscription.eventCallbackKey).toBe('symbol');
  });

  it('given a subscription, then its removeListener is a function', () => {
    const { subscription } = getEmitter();
    expect(typeof subscription.removeListener).toBe('function');
  });

  it('given emitter with first event registered, when emit the first event, then the registered first fn is called once', () => {
    const { emitter, spy } = getEmitter();
    emitter.emit(events.first);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('given emitter with spy on first, when emit first event with args, then the fn receives the args and is called', () => {
    const { emitter, spy } = getEmitter();
    let functionArgs: any[] = [];

    spy.mockImplementation((...args) => {
      functionArgs = args;
    });

    emitter.emit(events.first, 'arg1', 2);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(functionArgs.length).toBe(2);
    expect(functionArgs[0]).toBe('arg1');
    expect(functionArgs[1]).toBe(2);
  });

  it('given a subscription, when its removeListener is called then emit, then the spy is not called again (count stays)', () => {
    const { emitter, subscription, spy } = getEmitter();
    subscription.removeListener();
    emitter.emit(events.first);

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('given emitter, when removeListener called on it with the key then emit, then the spy count does not increase', () => {
    const { emitter, subscription, spy } = getEmitter();

    emitter.removeListener(subscription.eventCallbackKey);
    emitter.emit(events.first);

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('given emitter, when registering the same fn twice for same event, then the two subscriptions have different eventCallbackKey', () => {
    const { emitter, subscription } = getEmitter();
    const subscription_2: RemoveListener = emitter.on(
      events.first,
      functions.first
    );
    expect(
      subscription_2.eventCallbackKey !== subscription.eventCallbackKey
    ).toBe(true);
  });

  it('given emitter and two subs for first, when remove second sub then emit, then spy called total 3 times (initial + after first remove + after second)', () => {
    const { emitter, spy } = getEmitter();
    const subscription_2: RemoveListener = emitter.on(
      events.first,
      functions.first
    );
    subscription_2.removeListener();
    emitter.emit(events.first);

    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('given emitter with first sub, when register and emit second event, then second spy called once and first not affected beyond prior calls', () => {
    const { emitter, spy } = getEmitter();

    emitter.on(events.second, functions.second);
    const spy2 = vi.spyOn(functions, 'second');

    emitter.emit(events.second);

    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy2).toHaveBeenCalledTimes(1);
  });
});
