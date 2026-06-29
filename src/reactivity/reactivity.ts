import { debounce as _debounce, type DebouceCallback } from '../debounce';
import { isObject } from '../isObject';
import { setSymbolKey } from '../setSymbolKey';
import { targetMap, REACTIVE, REF, COMPUTED } from './constants';
import { isRef } from './isRef';
import { isReactive } from './isReactive';
import type { Computed, Reactive, Ref } from './types';

let activeEffect: any = null;

/**
 * Tracks dependencies for a given object and key during reactive operations.
 * @param target - The object being tracked.
 * @param key - The property key to track.
 */
function track(target: object, key: PropertyKey) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  dep.add(activeEffect);
}

/**
 * Triggers all effects associated with a given object and key.
 * @param target - The object whose effects are triggered.
 * @param key - The property key whose effects are triggered.
 */
function trigger(target: object, key: PropertyKey) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (!dep) return;

  for (const effect of dep) effect();
}

/**
 * Creates a reactive proxy for an object, enabling dependency tracking and effect triggering.
 * @typeParam T - The type of the object to make reactive.
 * @param obj - The object to make reactive.
 * @param deep - If true, nested objects are also made reactive. Defaults to false.
 * @returns A reactive proxy of the input object.
 */
export function reactive<T extends object>(obj: T, deep = false): Reactive<T> {
  setSymbolKey(obj, REACTIVE);

  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key);
      const result = Reflect.get(target, key, receiver);

      if (deep && isObject(result)) return reactive(result as object, true);

      return result;
    },
    set(target, key, value, receiver) {
      const oldVal = Reflect.get(target, key, receiver);
      const result = Reflect.set(target, key, value, receiver);

      if (oldVal !== value) trigger(target, key);

      return result;
    },
  });
}

/**
 * Creates a reactive reference (ref) for a value, wrapping it in a reactive object.
 * @typeParam T - The type of the value to wrap.
 * @param value - The value to make reactive.
 * @param deep - If true, nested objects within the value are also made reactive. Defaults to false.
 * @returns An object with a reactive `value` property.
 */
export function ref<T>(value: T, deep = false): Ref<T> {
  const obj = !deep ? {
    get value() {
      track(obj, 'value');
      return value;
    },
    set value(newValue) {
      value = newValue;
      trigger(obj, 'value');
    }
  } : { value };
  
  setSymbolKey(obj, REF);
  
  return !deep ? obj : reactive(obj, deep);
}

/**
 * Creates an effect that runs when its dependencies change.
 *
 * If no `source` is provided, the callback is executed immediately (automatically tracking
 * any reactive dependencies accessed inside it). When a `source` is provided, the callback
 * only re-runs when the tracked source(s) change.
 *
 * The `fn` callback may be async (the returned promise is ignored; side-effects inside will run).
 *
 * The `source` parameter supports several forms:
 * - A function that returns a single value or an array of values:
 *   `effect(fn, () => dep)` or `effect(fn, () => [dep1, dep2, myComputed.prop])`.
 *   Reactive accesses performed inside this function are tracked.
 * - A single `ref`, `reactive` object, or `computed`.
 * - An array of the above forms (use `() => value` wrappers for anything that is not
 *   already a direct Ref/Reactive/Computed).
 *
 * Computed values are always also treated as refs (they carry the `REF` marker), so they
 * can be passed directly as sources to `effect` or observed via their `.value`.
 *
 * @typeParam T - The type of the source value or computed result.
 * @param fn - The effect function to run, receiving new and old values. May be async.
 * @param source - The reactive source(s) to track. See description above. Optional.
 * @param immediate - If true, the effect runs immediately upon creation (before any source changes). Defaults to false.
 */
export function effect(
  fn: (newVal: any | any[], oldVal: any | any[]) => void | Promise<void>,
  source?: (() => any) | (() => any[]) | Ref<any> | Reactive<any> | Computed<any> | Array<(() => any) | Ref<any> | Reactive<any> | Computed<any>>,
  immediate = false
) {
  let getter: () => any = fn as () => any;

  if (!source) {
    // If no source is provided, just track everything inside fn
    getter = fn as () => any;
  } else if (Array.isArray(source)) {
    getter = () =>
      source.map(s => {
        if (typeof s === 'function') return (s as () => any)();
        if (isRef(s)) return (s as { value: any }).value;
        if (isReactive(s)) return Object.keys(s).reduce((acc, k) => ({ ...acc, [k]: (s as Record<PropertyKey, any>)[k] }), {});
      });
  } else if (typeof source === 'function') {
    getter = source as () => any;
  } else if (isRef(source)) {
    getter = () => source.value;
  } else if (isReactive(source)) {
    getter = () => Object.keys(source).reduce((acc, k) => ({ ...acc, [k]: (source as Record<PropertyKey, any>)[k] }), {});
  }

  const debounced: DebouceCallback = _debounce(runner, 16);

  activeEffect = debounced;

  let oldVal = getter();
  
  if (source && immediate) fn(oldVal, oldVal);

  activeEffect = null;

  function runner() {
    const newVal = getter();

    if (source) {
      // Only perform changed detection when a source is provided (getter is a pure value extractor,
      // the actual effect body is the `fn` passed to effect).
      const changed = Array.isArray(newVal)
        ? newVal.some((v, i) => v !== oldVal[i])
        : newVal !== oldVal;

      if (changed) {
        fn(newVal, oldVal);
        oldVal = newVal;
      }
    }
    // If no source was provided, `getter()` IS the effect body (the `fn`).
    // Calling it above already executed the (possibly async) body.
    // We intentionally do NOT call `fn` again.
  }
}

/**
 * Creates a computed value that lazily re-evaluates when its dependencies change.
 *
 * The `getter` may be synchronous or asynchronous (`() => T | Promise<T>`).
 *
 * @typeParam T - The type of the computed value (the resolved value if the getter is async).
 * @param getter - A function that computes the value. May be async.
 * @returns
 *   - If the (resolved) result of the getter is an object (per `isObject`, including arrays),
 *     returns a readonly proxy to that object. You can access properties directly
 *     (`computedObj.prop`) and the accesses are tracked. `.value` is also available and
 *     returns the raw object.
 *   - For non-object results, returns the classic `{ readonly value: T }`.
 *
 * In all cases the returned value carries the `REF` marker, so computed results are
 * treated as refs (usable directly as sources to `effect()`, observable via `.value`, etc.).
 * It also carries the `COMPUTED` marker for `isComputed()`.
 *
 * While an async getter is pending, reading the result (via direct properties or `.value`)
 * returns the previous (stale) value. A new computation is started on the first access
 * after the computed is marked dirty.
 */
export function computed<T>(getter: () => T | Promise<T>): Computed<T> {
  let cached: T | undefined;
  let dirty = true;
  let computationId = 0;

  const internal: any = {};

  const runner = () => {
    if (!dirty) {
      dirty = true;
      trigger(internal, 'value');
    }
  };

  function ensureComputed() {
    if (!dirty) return;

    const id = ++computationId;
    const prevActive = activeEffect;
    activeEffect = runner;

    const result = getter();
    activeEffect = prevActive;

    if (result && typeof (result as any).then === 'function') {
      (result as Promise<T>).then((val) => {
        if (id === computationId) {
          cached = val;
          dirty = false;
          trigger(internal, 'value');
        }
      }).catch((err) => {
        if (id === computationId) {
          dirty = false;
          // eslint-disable-next-line no-console
          console.error('Error in async computed getter:', err);
        }
      });
      // dirty stays true until (this or a newer) resolution
    } else {
      cached = result as T;
      dirty = false;
    }
  }

  // Unified proxy returned by computed.
  // - Always exposes .value (the raw last-resolved result of the getter)
  // - If the result is an object (or array), also forwards property accesses (with tracking + fresh check)
  const proxy = new Proxy({} as any, {
    get(target, prop, receiver) {
      if (dirty) ensureComputed();
      track(internal, 'value');

      const current = cached as any;

      if (prop === REF) {
        return true;
      }

      if (prop === 'value') {
        return current;
      }

      const treatAsObject = isObject(current) || Array.isArray(current);
      if (treatAsObject && prop in current) {
        let v = current[prop];
        if (typeof v === 'function' && prop !== 'constructor') {
          // Bind so array/object methods keep the correct `this` (the real current value)
          // even if the function is extracted from the proxy.
          v = v.bind(current);
        }
        return v;
      }

      return Reflect.get(target, prop, receiver);
    },

    set() {
      // Treat as readonly
      return false;
    },

    has(target, prop) {
      if (prop === REF) return true;
      const current = cached as any;
      const treatAsObject = isObject(current) || Array.isArray(current);
      return treatAsObject && prop in current;
    },

    ownKeys(): ArrayLike<string | symbol> {
      const current = cached as any;
      const treatAsObject = isObject(current) || Array.isArray(current);
      let keys: (string | symbol)[] = treatAsObject ? (Reflect.ownKeys(current) as (string | symbol)[]) : [];
      // include marker symbols so Object.getOwnPropertySymbols and hasOwn work for isRef/isComputed
      if (!keys.includes(REF)) keys.push(REF);
      if (!keys.includes(COMPUTED)) keys.push(COMPUTED);
      return keys;
    },

    getOwnPropertyDescriptor(target, prop) {
      if (prop === REF || prop === COMPUTED) {
        return {
          configurable: false,
          enumerable: false,
          value: true,
          writable: false,
        };
      }
      const current = cached as any;
      const treatAsObject = isObject(current) || Array.isArray(current);
      if (treatAsObject && prop in current) {
        return {
          configurable: true,
          enumerable: true,
          value: current[prop],
          writable: false,
        };
      }
      return undefined;
    },

    defineProperty(target, prop, descriptor) {
      if (prop === REF || prop === COMPUTED) {
        // allow setSymbolKey to define the marker
        return Reflect.defineProperty(target, prop, descriptor);
      }
      return false;
    },
  });

  // We intentionally set *both* symbols on the proxy:
  //
  // - REF: so that the result is recognized as a "ref" by isRef() and, more importantly,
  //        by the effect() machinery:
  //          } else if (isRef(source)) {
  //            getter = () => source.value;
  //          }
  //        This makes computed values usable directly as sources to effect() (they are
  //        treated as a kind of ref for dependency tracking).
  //
  // - COMPUTED: so that the dedicated isComputed() predicate works.
  //
  // In short: every computed is a ref (for the effect system), and additionally a computed.
  setSymbolKey(proxy, REF);
  setSymbolKey(proxy, COMPUTED);

  return proxy as any as Computed<T>;
}
