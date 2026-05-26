import { debounce as _debounce, type DebouceCallback } from '../debounce';
import { isObject } from '../isObject';
import { targetMap, REACTIVE, REF } from './constants';
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
  Object.defineProperty(obj, REACTIVE, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  });

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
  
  Object.defineProperty(obj, REF, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  });
  
  return !deep ? obj : reactive(obj, deep);
}

/**
 * Creates an effect that runs when its dependencies change.
 * If there are not dependencies specified (source), the function callback is immediatelly executed registering the dependencies
 * automatically.
 * if dependencies are specified, the effect callback function will run just if any of the the dependencies changes.
 * if you want to run immediatelly the function you can pass "true" as third parameter.
 * The dependenciesrould be a function which returns the value to track of a reactive object "() => obj.a", a ref object, a reactive object itself or
 * an array of these.
 * If a reactive object is passed as dependency the function will run when any of the reactive object properties will change.
 * @typeParam T - The type of the source value or computed result.
 * @param fn - The effect function to run, receiving new and old values.
 * @param source - The reactive source(s) to track (function, ref, reactive object, or array of sources). Optional.
 * @param immediate - If true, the effect runs immediately. Defaults to false.
 */
export function effect(
  fn: (newVal: any | any[], oldVal: any | any[]) => void,
  source?: (() => any) | Ref<any> | Reactive<any> | Computed<any> | Array<(() => any) | Ref<any> | Reactive<any> | Computed<any>>,
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
        if (isReactive(s)) return Object.keys(s).reduce((acc, k) => ({ ...acc, [k]: (source as Record<PropertyKey, any>)[k] }), {});
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

    const changed = Array.isArray(newVal)
      ? newVal.some((v, i) => v !== oldVal[i])
      : newVal !== oldVal;

    if (changed) {
      fn(newVal, oldVal);
      oldVal = newVal;
    }
  }
}

/**
 * Creates a computed value that lazily re-evaluates when dependencies change.
 * @typeParam T - The type of the computed value.
 * @param getter - A function that computes the value.
 * @returns An object with a readonly `value` property that returns the computed value.
 */
export function computed<T>(getter: () => T): Computed<T> {
  let cached: T;
  let dirty = true;

  // Runner re-evaluates getter whenever dependencies change
  const runner = () => { dirty = true; };

  const effectWrapper = () => {
    activeEffect = runner;
    cached = getter();
    activeEffect = null;
    dirty = false;
  };

  const obj = {
    get value() {
      if (dirty) effectWrapper();
      // track this computed so effects can depend on it
      track({ computed: getter }, 'value');
      return cached!;
    },
  };

  Object.defineProperty(obj, REF, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  });

  return obj;
}
