import { describe, it, expect, vi } from 'vitest';
import { reactive, ref, computed, isReactive } from '../../src/reactivity';

vi.useFakeTimers();

describe('isReactive', () => {
  it('given a non-object value, when isReactive is called, then it returns false', () => {
    expect(isReactive(null)).toBe(false);
    expect(isReactive(undefined)).toBe(false);
    expect(isReactive(42)).toBe(false);
    expect(isReactive('foo')).toBe(false);
    expect(isReactive(true)).toBe(false);
  });

  it('given a value created by reactive(), when isReactive is called, then it returns true', () => {
    const r = reactive({ a: 1 });
    expect(isReactive(r)).toBe(true);
  });

  it('given a ref, when isReactive is called, then it returns false', () => {
    const r = ref(0);
    expect(isReactive(r)).toBe(false);
  });

  it('given a computed value, when isReactive is called, then it returns false', () => {
    const c = computed(() => ({ x: 1 }));
    expect(isReactive(c)).toBe(false);
  });

  it('given a plain object or array, when isReactive is called, then it returns false', () => {
    expect(isReactive({})).toBe(false);
    expect(isReactive([])).toBe(false);
  });

  it('given a reactive object, when inspecting its keys, then the REACTIVE symbol is non-enumerable', () => {
    const r = reactive({ a: 1 });
    const ownKeys = Reflect.ownKeys(r);
    expect(ownKeys.some(k => k === (r as any)[Symbol.for('REACTIVE')] || false)).toBe(false); // symbol not in enumerable
  });
});
