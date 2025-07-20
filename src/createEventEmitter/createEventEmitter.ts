import type { EventEmitter, EventCallback, RemoveListener } from './types';

/**
 * Creates an event emitter that allows subscribing to events, emitting events, and removing event listeners.
 *
 * @returns {EventEmitter} An object containing methods to interact with the event emitter.
 *
 * @example
 * const emitter = createEventEmitter();
 * const listener = emitter.on('event', (data) => console.log(data));
 * emitter.emit('event', 'Hello, World!');
 * listener.removeListener();
 */
export function createEventEmitter(): EventEmitter {
  const events: { [eventName: string]: Map<symbol, EventCallback> } = {};
  const keys: { [eventCallbackKey: symbol]: string } = {};

  /**
   * Unsubscribes an event listener from a specific event.
   *
   * @param {string} eventName - The name of the event.
   * @param {symbol} eventCallbackKey - The unique key for the event callback.
   */
  function unsubscribe(eventName: string, eventCallbackKey: symbol): void {
    events[eventName].delete(eventCallbackKey);
    delete keys[eventCallbackKey];
  }

  /**
   * Emits an event, calling all subscribed event listeners with the provided arguments.
   *
   * @param {string} eventName - The name of the event to emit.
   * @param {...any[]} args - Arguments to pass to the event listeners.
   */
  function emit(eventName: string, ...args: any[]): void {
    if (events[eventName]) {
      const callBackCache = new Set();

      events[eventName].forEach(
        (eventCallback: EventCallback) => {
          if (!callBackCache.has(eventCallback)) {
            callBackCache.add(eventCallback);
            eventCallback(...args);
          }
        }
      );
    }
  }

  /**
   * Subscribes an event listener to a specific event.
   *
   * @param {string} eventName - The name of the event to subscribe to.
   * @param {EventCallback} eventCallback - The callback function to execute when the event is emitted.
   * @returns {RemoveListener} An object with a `removeListener` method to unsubscribe from the event.
   */
  function on(eventName: string, eventCallback: EventCallback): RemoveListener {
    if (!events[eventName]) {
      events[eventName] = new Map();
    }

    const eventCallbackKey = Symbol();
    events[eventName].set(eventCallbackKey, eventCallback);
    keys[eventCallbackKey] = eventName;

    return Object.freeze({
      eventCallbackKey,
      removeListener: () => unsubscribe(eventName, eventCallbackKey)
    });
  }

  /**
   * Removes an event listener using its unique key.
   *
   * @param {symbol} eventCallbackKey - The unique key for the event callback to remove.
   */
  function removeListener(eventCallbackKey: symbol): void {
    const event = keys[eventCallbackKey];
    if (event) {
      unsubscribe(event, eventCallbackKey);
    }
  }

  return Object.freeze({ emit, on, removeListener });
}
