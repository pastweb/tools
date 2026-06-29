import { describe, it, expect } from 'vitest';
import { withDefaults } from '../../src';

describe('given the withDefaults function', () => {
  it('given target and empty defaults, when withDefaults, then result === target (shallow equal content)', () => {
    const target = { a: 1, b: 2 };
    const defaults = {};
    
    const result = withDefaults(target, defaults);
    
    expect(result).toEqual(target);
  });

  it('given target missing c, defaults has b,c , when withDefaults, then result has a,b from target + c from defaults', () => {
    const target = { a: 1, b: 2 };
    const defaults = { b: 10, c: 3 };
    
    const result = withDefaults(target, defaults);
    
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('given target a b, defaults b c (b different), when, then b keeps target value, c added', () => {
    const target = { a: 1, b: 2 };
    const defaults = { b: 10, c: 3 };
    
    const result = withDefaults(target, defaults);
    
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('given empty target, defaults a b, when withDefaults, then result = defaults', () => {
    const target = {};
    const defaults = { a: 1, b: 2 };
    
    const result = withDefaults(target, defaults);
    
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('given empty target and empty defaults, when, then result empty {}', () => {
    const target = {};
    const defaults = {};
    
    const result = withDefaults(target, defaults);
    
    expect(result).toEqual({});
  });

  it('given target a{x:1} b, defaults a{y:2} c , when, then result a{x:1} (not merged),b,c  -- note: shallow on top level nested', () => {
    const target = { a: { x: 1 }, b: 2 };
    const defaults = { a: { y: 2 }, c: 3 };
    
    const result = withDefaults(target, defaults);
    
    expect(result).toEqual({ a: { x: 1 }, b: 2, c: 3 });
  });

  it('given target a{x}, defaults a{y} b, when withDefaults, then result a{x} (target nested not overwritten), b added', () => {
    const target = { a: { x: 1 } };
    const defaults = { a: { y: 2 }, b: 3 };
    
    const result = withDefaults(target, defaults);
    
    expect(result).toEqual({ a: { x: 1 }, b: 3 });
  });
});
