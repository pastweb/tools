import { describe, it, expect } from 'vitest';
import { globalContext, GLOBAL_CONTEXT_TYPE, isGlobalContext } from '../../src/globalContext';

describe('given isGlobalContext predicate', () => {
  it('when called with the globalContext singleton, then returns true', () => {
    expect(isGlobalContext(globalContext)).toBe(true);
  });

  it('given non object values (null,undef,prim,arr,fn), when isGlobalContext, then all return false', () => {
    expect(isGlobalContext(null)).toBe(false);
    expect(isGlobalContext(undefined)).toBe(false);
    expect(isGlobalContext(42)).toBe(false);
    expect(isGlobalContext('string')).toBe(false);
    expect(isGlobalContext(true)).toBe(false);
    expect(isGlobalContext([])).toBe(false);
    expect(isGlobalContext(() => {})).toBe(false);
  });

  it('given plain {} or {name}, when isGlobalContext, then returns false', () => {
    expect(isGlobalContext({})).toBe(false);
    expect(isGlobalContext({ name: 'test' })).toBe(false);
  });

  it('given object with wrong symbol key for GLOBAL_CONTEXT_TYPE, when isGlobalContext, then false', () => {
    const fakeContext = {
      [Symbol('GLOBAL_CONTEXT_TYPE')]: true,
      someProp: 'value',
    };

    expect(isGlobalContext(fakeContext)).toBe(false);
  });

  it('given object with non-enum non-writable GLOBAL_CONTEXT_TYPE symbol set to true, when isGlobalContext, then true', () => {
    const customContext = {};
    Object.defineProperty(customContext, GLOBAL_CONTEXT_TYPE, {
      value: true,
      enumerable: false,
      writable: false,
      configurable: false,
    });

    expect(isGlobalContext(customContext)).toBe(true);
  });

  it('given object with string props named GLOBAL_ etc, when isGlobalContext, then false', () => {
    const misleading = {
      GLOBAL_CONTEXT_TYPE: true,
      isGlobalContext: true,
      globalContext: true,
    };

    expect(isGlobalContext(misleading)).toBe(false);
  });

  it('given real globalContext and a fake with other symbol, when is..., then true for real, false for fake', () => {
    const realContext = globalContext;
    const fakeContext = { [Symbol('other')]: true };

    expect(isGlobalContext(realContext)).toBe(true);
    expect(isGlobalContext(fakeContext)).toBe(false);
  });
});
