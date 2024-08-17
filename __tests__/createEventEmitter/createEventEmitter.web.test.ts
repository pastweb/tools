import { createEventEmitter } from '../../src/createEventEmitter';
import { RemoveListener } from '../../src/createEventEmitter/types';
import { isObject } from '../../src/isObject';

const functions: { [key: string]: any } = {
  first: jest.fn(),
  second: jest.fn()
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
  const spy = jest.spyOn(functions, 'first');

  return { emitter, subscription, spy };
}

describe('createEventEmitter', () => {
  it('on register event the emitter should return a defined object.', () => {
    const { subscription } = getEmitter();
    expect(subscription).toBeDefined();
    expect(isObject(subscription)).toBe(true);
  });

  it('the RemoveListener should contains a key and a removeListener properties.', () => {
    const { subscription } = getEmitter();
    expect(subscription.hasOwnProperty('eventCallbackKey')).toBe(true);
    expect(subscription.hasOwnProperty('removeListener')).toBe(true);
  });

  it('the "eventCallbackKey" value in the event Object should by a Symbol.', () => {
    const { subscription } = getEmitter();
    expect(typeof subscription.eventCallbackKey).toBe('symbol');
  });

  it('the "removeListener" value in the event Object should by a function.', () => {
    const { subscription } = getEmitter();
    expect(typeof subscription.removeListener).toBe('function');
  });

  it('the first function should be registered and called on the first event.', () => {
    const { emitter, spy } = getEmitter();
    emitter.emit(events.first);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('the first function should receive the arguments present on the emit call.', () => {
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

  it('removeListener inside the event Object should works.', () => {
    const { emitter, subscription, spy } = getEmitter();
    subscription.removeListener();
    emitter.emit(events.first);

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('removeListener inside emitter instance should works.', () => {
    const { emitter, subscription, spy } = getEmitter();

    emitter.removeListener(subscription.eventCallbackKey);
    emitter.emit(events.first);

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('registering the same function the EventCallbackKey should be different', () => {
    const { emitter, subscription } = getEmitter();
    const subscription_2: RemoveListener = emitter.on(
      events.first,
      functions.first
    );
    expect(
      subscription_2.eventCallbackKey !== subscription.eventCallbackKey
    ).toBe(true);
  });

  it('the function should called 4 times after the second reference has been removed.', () => {
    const { emitter, spy } = getEmitter();
    const subscription_2: RemoveListener = emitter.on(
      events.first,
      functions.first
    );
    subscription_2.removeListener();
    emitter.emit(events.first);

    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('on register the second event, the emitter should call the second function.', () => {
    const { emitter, spy } = getEmitter();

    emitter.on(events.second, functions.second);
    const spy2 = jest.spyOn(functions, 'second');

    emitter.emit(events.second);

    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy2).toHaveBeenCalledTimes(1);
  });
});
