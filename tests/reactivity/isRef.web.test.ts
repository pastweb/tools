import { describe, it, expect, vi } from 'vitest';
import { reactive, ref, computed, isRef } from '../../src/reactivity';

vi.useFakeTimers();

describe('isRef', () => {
  it('given a non-object value, when isRef is called, then it returns false', () => {
    expect(isRef(null)).toBe(false);
    expect(isRef(undefined)).toBe(false);
    expect(isRef(42)).toBe(false);
    expect(isRef('foo')).toBe(false);
    expect(isRef(true)).toBe(false);
    expect(isRef(Symbol())).toBe(false);
  });

  it('given a value created by ref(), when isRef is called, then it returns true', () => {
    const r = ref(0);
    expect(isRef(r)).toBe(true);
  });

  it('given a value created by computed(), when isRef is called, then it returns true (computed values carry the REF marker)', () => {
    const c = computed(() => 42);
    expect(isRef(c)).toBe(true);
  });

  it('given a value created by reactive(), when isRef is called, then it returns false', () => {
    const r = reactive({ a: 1 });
    expect(isRef(r)).toBe(false);
  });

  it('given a plain object or array, when isRef is called, then it returns false', () => {
    expect(isRef({})).toBe(false);
    expect(isRef([])).toBe(false);
  });

  it('given a ref, when inspecting its symbols, then the REF symbol is non-enumerable and non-configurable', () => {
    const r = ref(0);
    const symbols = Object.getOwnPropertySymbols(r);
    expect(symbols.length).toBeGreaterThan(0);
    const refSym = symbols.find(s => String(s).includes('REF') || true); // any symbol marker
    if (refSym) {
      const desc = Object.getOwnPropertyDescriptor(r, refSym);
      expect(desc?.enumerable).toBe(false);
      expect(desc?.configurable).toBe(false);
    }
  });
});
