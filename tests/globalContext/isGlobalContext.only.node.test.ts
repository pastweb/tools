import { describe, it, expect } from 'vitest';
import { globalContext, GLOBAL_CONTEXT_TYPE, isGlobalContext } from '../../src/globalContext';

describe('isGlobalContext', () => {
  it('returns true for the main globalContext object', () => {
    expect(isGlobalContext(globalContext)).toBe(true);
  });

  it('returns false for non-objects', () => {
    expect(isGlobalContext(null)).toBe(false);
    expect(isGlobalContext(undefined)).toBe(false);
    expect(isGlobalContext(42)).toBe(false);
    expect(isGlobalContext('string')).toBe(false);
    expect(isGlobalContext(true)).toBe(false);
    expect(isGlobalContext([])).toBe(false);
    expect(isGlobalContext(() => {})).toBe(false);
  });

  it('returns false for plain objects', () => {
    expect(isGlobalContext({})).toBe(false);
    expect(isGlobalContext({ name: 'test' })).toBe(false);
  });

  it('returns false for objects with similar but incorrect symbol', () => {
    const fakeContext = {
      [Symbol('GLOBAL_CONTEXT_TYPE')]: true,
      someProp: 'value',
    };

    expect(isGlobalContext(fakeContext)).toBe(false);
  });

  it('detects manually marked global context objects', () => {
    const customContext = {};
    Object.defineProperty(customContext, GLOBAL_CONTEXT_TYPE, {
      value: true,
      enumerable: false,
      writable: false,
      configurable: false,
    });

    expect(isGlobalContext(customContext)).toBe(true);
  });

  it('is robust against objects with misleading property names', () => {
    const misleading = {
      GLOBAL_CONTEXT_TYPE: true,
      isGlobalContext: true,
      globalContext: true,
    };

    expect(isGlobalContext(misleading)).toBe(false);
  });

  it('works correctly with multiple context-like objects', () => {
    const realContext = globalContext;
    const fakeContext = { [Symbol('other')]: true };

    expect(isGlobalContext(realContext)).toBe(true);
    expect(isGlobalContext(fakeContext)).toBe(false);
  });
});
