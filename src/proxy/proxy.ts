import type { ProxyCallback } from './types';

/**
 * Creates a proxy object that intercepts get, set, and delete operations on the target object.
 * It invokes a callback function asynchronously after a delay whenever one of these operations occurs.
 * The proxy can filter which properties trigger the callback based on the provided property keys.
 *
 * @param target - The target object to be proxied.
 * @param callback - A callback function that is invoked after a property is accessed, modified, or deleted.
 * @param filter - Optional. A list of properties (strings, numbers, or symbols) to filter which properties should trigger the callback. 
 * If no filter is provided, the callback is invoked for all properties.
 * @returns A new proxy object that wraps the target object.
 * 
 * @template T - The type of the target object.
 */
export function proxy<T extends object = {}>(
  target: T,
  callback: ProxyCallback,
  ...filter: (Extract<keyof T, string> | number | symbol)[]): T
{
  const _filter: (string | symbol)[] = filter.map((prop: string | number | symbol) => typeof prop === 'symbol' ? prop :  `${prop}`);
  const weakCb = new WeakRef<ProxyCallback>(callback);
  
  const handler: ProxyHandler<T> = {
    get(target, prop, receiver): any {
      const cb = weakCb.deref();

      if (!cb) {
        removeProxy();
        return true;
      }

      const t = target as Record<string | symbol, any>;
      const value = t[prop];

      if (typeof value === 'function' && (!_filter.length || _filter.includes(prop))) {
        return (...args: any[]) => {
          const result = Reflect.apply(value, target, args);

          setTimeout(() => (async () => await (cb as ProxyCallback)({
            newValue: value,
            oldValue: value,
            prop: typeof prop === 'symbol' ? prop : !isNaN(Number(prop)) ? parseFloat(prop) : prop,
            action: 'get',
            args,
          }))(), 16);

          return result;
        };
      }

      return t[prop];
    },
    set(target, prop, newValue, receiver): boolean {
      const cb = weakCb.deref();

      if (!cb) {
        removeProxy();
        return true;
      }

      const t = target as Record<string | symbol, any>;
      
      if (newValue === t[prop]) return true;

      const oldValue = t[prop];
      t[prop] = newValue;
      
      if (!_filter.length || _filter.includes(prop)) {
        setTimeout(() => (async () => await (cb as ProxyCallback)({
          newValue,
          oldValue,
          prop: typeof prop === 'symbol' ? prop : !isNaN(Number(prop)) ? parseFloat(prop) : prop,
          action: 'set',
          args: [],  
        }))(), 16);
      }

      return true;
    },
    deleteProperty(target, prop): boolean {
      const cb = weakCb.deref();

      if (!cb) {
        removeProxy();
        return true;
      }

      const t = target as Record<string | symbol, any>;
      
      if (!(prop in t)) return true;
      
      delete t[prop];

      if (!_filter.length || _filter.includes(prop)) {
        setTimeout(() => (async () => await (cb as ProxyCallback)({
          newValue: undefined,
          oldValue: t[prop],
          prop: typeof prop === 'symbol' ? prop : !isNaN(Number(prop)) ? parseFloat(prop) : prop,
          action: 'delete',
          args: [],
        }))(), 16);
      }

      return true;
    },
  };

  let proxy: T | null = new Proxy<T>(target, handler);

  function removeProxy() { proxy = null; }

  return proxy;
}
