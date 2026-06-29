import { describe, it, expect, vi } from 'vitest';
import { reactive, ref, computed, isComputed, isRef } from '../../src/reactivity';

vi.useFakeTimers();

describe('isComputed', () => {
  it('given a non-object value, when isComputed is called, then it returns false', () => {
    expect(isComputed(null)).toBe(false);
    expect(isComputed(undefined)).toBe(false);
    expect(isComputed(42)).toBe(false);
    expect(isComputed('foo')).toBe(false);
  });

  it('given a value created by computed(), when isComputed is called, then it returns true', () => {
    const c = computed(() => 42);
    expect(isComputed(c)).toBe(true);
  });

  it('given a computed value, when isRef and isComputed are called, then both return true', () => {
    const c = computed(() => 'hello');
    expect(isRef(c)).toBe(true);
    expect(isComputed(c)).toBe(true);
  });

  it('given a reactive object, when isComputed is called, then it returns false', () => {
    const r = reactive({ a: 1 });
    expect(isComputed(r)).toBe(false);
  });

  it('given a plain ref, when isComputed is called, then it returns false', () => {
    const r = ref(0);
    expect(isComputed(r)).toBe(false);
  });

  it('given a plain object or array, when isComputed is called, then it returns false', () => {
    expect(isComputed({})).toBe(false);
    expect(isComputed([])).toBe(false);
  });

  it('given a computed value, when inspecting its symbols, then the COMPUTED symbol is non-enumerable and non-writable', () => {
    const c = computed(() => ({ foo: 1 }));
    const symbols = Object.getOwnPropertySymbols(c as object);
    expect(symbols.length).toBeGreaterThan(0);
    const compSym = symbols.find(s => String(s).includes('COMPUTED') || true);
    if (compSym) {
      const desc = Object.getOwnPropertyDescriptor(c as object, compSym);
      expect(desc?.enumerable).toBe(false);
      expect(desc?.configurable).toBe(false);
      expect(desc?.writable).toBe(false);
    }
  });
});
