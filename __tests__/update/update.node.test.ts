import { update } from '../../src';

describe('update', () => {
  it('should update properties in the target object', () => {
    const target = { a: 1, b: 2 };
    const toUpdate = { a: 10 };
    
    update(target, toUpdate);
    
    expect(target).toEqual({ a: 10, b: 2 });
  });

  it('should perform a deep update for nested objects', () => {
    const target = { a: 1, b: { c: 2 } };
    const toUpdate = { b: { c: 20 } };
    
    update(target, toUpdate);
    
    expect(target).toEqual({ a: 1, b: { c: 20 } });
  });

  it('should perform a shallow update when shallow option is true', () => {
    const target = { a: 1, b: { c: 2, d: 3 } };
    const toUpdate = { b: { c: 20 } };
    
    update<any>(target, toUpdate, { shallow: true });
    
    expect(target).toEqual({ a: 1, b: { c: 20 } });
  });

  it('should exclude specified properties from the update', () => {
    const target = { a: 1, b: 2 };
    const toUpdate = { a: 10, b: 20 };
    
    update(target, toUpdate, { exclude: 'a' });
    
    expect(target).toEqual({ a: 1, b: 20 });
  });

  it('should handle multiple properties in the exclude option', () => {
    const target = { a: 1, b: 2, c: 3 };
    const toUpdate = { a: 10, b: 20, c: 30 };
    
    update(target, toUpdate, { exclude: ['a', 'c'] });
    
    expect(target).toEqual({ a: 1, b: 20, c: 3 });
  });

  it('should not update if the new value is the same as the existing value', () => {
    const target = { a: 1, b: { c: 2 } };
    const toUpdate = { b: { c: 2 } };
    
    update(target, toUpdate);
    
    expect(target).toEqual({ a: 1, b: { c: 2 } });
  });

  it('should handle empty toUpdate object', () => {
    const target = { a: 1, b: 2 };
    
    update(target, {});
    
    expect(target).toEqual({ a: 1, b: 2 });
  });

  it('should handle non-object values gracefully', () => {
    const target = { a: 1, b: 2 };
    
    update(target, null as any); // Pass null to simulate invalid input
    
    expect(target).toEqual({ a: 1, b: 2 });
  });

  it('should update deeply nested properties', () => {
    const target = { a: 1, b: { c: { d: 4 } } };
    const toUpdate = { b: { c: { d: 40 } } };
    
    update(target, toUpdate);
    
    expect(target).toEqual({ a: 1, b: { c: { d: 40 } } });
  });
});
