import { describe, it, expect } from 'vitest';
import { GLOBAL_CONTEXT_TYPE, isGlobalContext, setAsGlobalContext } from '../../src/globalContext';

describe('given setAsGlobalContext', () => {
  it('given target {}, when setAsGlobalContext(target), then target has the GLOBAL symbol set to true', () => {
    const target = {};

    setAsGlobalContext(target);

    expect((target as any)[GLOBAL_CONTEXT_TYPE]).toBe(true);
  });

  it('given target, when setAs..., then return value is undefined', () => {
    const target = {};
    const result = setAsGlobalContext(target);

    expect(result).toBeUndefined();
  });

  it('given target after setAs, then the symbol descriptor is non-enum, non-writ, non-config', () => {
    const target = {};

    setAsGlobalContext(target);

    const descriptor = Object.getOwnPropertyDescriptor(target, GLOBAL_CONTEXT_TYPE);

    expect(descriptor).toBeDefined();
    expect(descriptor?.value).toBe(true);
    expect(descriptor?.enumerable).toBe(false);
    expect(descriptor?.writable).toBe(false);
    expect(descriptor?.configurable).toBe(false);
  });

  it('given target, when setAs called multiple times, then isGlobalContext still true', () => {
    const target = {};

    setAsGlobalContext(target);
    setAsGlobalContext(target);
    setAsGlobalContext(target);

    expect(isGlobalContext(target)).toBe(true);
  });

  it('given a simulated reactive obj, when setAsGlobalContext, then isGlobalContext returns true', () => {
    const reactiveObj = { count: 0 };
    // Simulate reactive object
    Object.defineProperty(reactiveObj, '__v_isReactive', { value: true });

    setAsGlobalContext(reactiveObj as any);

    expect(isGlobalContext(reactiveObj)).toBe(true);
  });

  it('given target with name/version, when setAs, then original props preserved and isGlobal true', () => {
    const target = {
      name: 'Global Context',
      version: 1,
    };

    setAsGlobalContext(target);

    expect(target.name).toBe('Global Context');
    expect(target.version).toBe(1);
    expect(isGlobalContext(target)).toBe(true);
  });

  it('given fresh target (is false), after setAs then isGlobal true', () => {
    const target = {};

    expect(isGlobalContext(target)).toBe(false);

    setAsGlobalContext(target);

    expect(isGlobalContext(target)).toBe(true);
  });
});
