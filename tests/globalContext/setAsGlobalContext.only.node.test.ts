import { describe, it, expect } from 'vitest';
import { GLOBAL_CONTEXT_TYPE, isGlobalContext, setAsGlobalContext } from '../../src/globalContext';

describe('setAsGlobalContext', () => {
  it('adds the GLOBAL_CONTEXT_TYPE symbol to the target object', () => {
    const target = {};

    setAsGlobalContext(target);

    expect((target as any)[GLOBAL_CONTEXT_TYPE]).toBe(true);
  });

  it('returns undefined (void)', () => {
    const target = {};
    const result = setAsGlobalContext(target);

    expect(result).toBeUndefined();
  });

  it('makes the symbol non-enumerable, non-writable and non-configurable', () => {
    const target = {};

    setAsGlobalContext(target);

    const descriptor = Object.getOwnPropertyDescriptor(target, GLOBAL_CONTEXT_TYPE);

    expect(descriptor).toBeDefined();
    expect(descriptor?.value).toBe(true);
    expect(descriptor?.enumerable).toBe(false);
    expect(descriptor?.writable).toBe(false);
    expect(descriptor?.configurable).toBe(false);
  });

  it('can be called multiple times safely', () => {
    const target = {};

    setAsGlobalContext(target);
    setAsGlobalContext(target);
    setAsGlobalContext(target);

    expect(isGlobalContext(target)).toBe(true);
  });

  it('works with already reactive objects', () => {
    const reactiveObj = { count: 0 };
    // Simulate reactive object
    Object.defineProperty(reactiveObj, '__v_isReactive', { value: true });

    setAsGlobalContext(reactiveObj as any);

    expect(isGlobalContext(reactiveObj)).toBe(true);
  });

  it('does not interfere with existing properties', () => {
    const target = {
      name: 'Global Context',
      version: 1,
    };

    setAsGlobalContext(target);

    expect(target.name).toBe('Global Context');
    expect(target.version).toBe(1);
    expect(isGlobalContext(target)).toBe(true);
  });

  it('integrates correctly with isGlobalContext', () => {
    const target = {};

    expect(isGlobalContext(target)).toBe(false);

    setAsGlobalContext(target);

    expect(isGlobalContext(target)).toBe(true);
  });
});
