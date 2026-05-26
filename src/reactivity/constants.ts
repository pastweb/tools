export const REACTIVE = Symbol();
export const REF = Symbol();
export const targetMap = new WeakMap<object, Map<PropertyKey, Set<Function>>>();
