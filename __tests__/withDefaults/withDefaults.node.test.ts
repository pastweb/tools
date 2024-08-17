import { withDefaults } from '../../src';

describe('withDefaults', () => {
  it('should return the target object when no defaults are provided', () => {
    const target = { a: 1, b: 2 };
    const defaults = {};
    
    const result = withDefaults(target, defaults);
    
    expect(result).toEqual(target);
  });

  it('should add missing properties from defaults to the target object', () => {
    const target = { a: 1, b: 2 };
    const defaults = { b: 10, c: 3 };
    
    const result = withDefaults(target, defaults);
    
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('should not overwrite existing properties in the target object', () => {
    const target = { a: 1, b: 2 };
    const defaults = { b: 10, c: 3 };
    
    const result = withDefaults(target, defaults);
    
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('should handle cases where target object is empty', () => {
    const target = {};
    const defaults = { a: 1, b: 2 };
    
    const result = withDefaults(target, defaults);
    
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should handle cases where both target and defaults are empty', () => {
    const target = {};
    const defaults = {};
    
    const result = withDefaults(target, defaults);
    
    expect(result).toEqual({});
  });

  it('should work with nested objects in the target and defaults', () => {
    const target = { a: { x: 1 }, b: 2 };
    const defaults = { a: { y: 2 }, c: 3 };
    
    const result = withDefaults(target, defaults);
    
    expect(result).toEqual({ a: { x: 1 }, b: 2, c: 3 });
  });

  it('should not overwrite nested objects in the target object', () => {
    const target = { a: { x: 1 } };
    const defaults = { a: { y: 2 }, b: 3 };
    
    const result = withDefaults(target, defaults);
    
    expect(result).toEqual({ a: { x: 1 }, b: 3 });
  });
});
