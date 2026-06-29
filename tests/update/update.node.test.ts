import { describe, it, expect } from 'vitest';
import { update } from '../../src';

describe('given the update function', () => {
  it('given target {a:1,b:2} toUpdate {a:10}, when update, then target becomes {a:10,b:2}', () => {
    const target = { a: 1, b: 2 };
    const toUpdate = { a: 10 };
    
    update(target, toUpdate);
    
    expect(target).toEqual({ a: 10, b: 2 });
  });

  it('given nested target and toUpdate, when update, then deep merge updates only the leaf', () => {
    const target = { a: 1, b: { c: 2 } };
    const toUpdate = { b: { c: 20 } };
    
    update(target, toUpdate);
    
    expect(target).toEqual({ a: 1, b: { c: 20 } });
  });

  it('given nested with shallow:true, when update partial nested, then replaces the nested (shallow)', () => {
    const target = { a: 1, b: { c: 2, d: 3 } };
    const toUpdate = { b: { c: 20 } };
    
    update<any>(target, toUpdate, { shallow: true });
    
    expect(target).toEqual({ a: 1, b: { c: 20 } });
  });

  it('given exclude "a", when update, then a not updated, b is', () => {
    const target = { a: 1, b: 2 };
    const toUpdate = { a: 10, b: 20 };
    
    update(target, toUpdate, { exclude: 'a' });
    
    expect(target).toEqual({ a: 1, b: 20 });
  });

  it('given exclude ["a","c"], when update, then a,c unchanged b updated', () => {
    const target = { a: 1, b: 2, c: 3 };
    const toUpdate = { a: 10, b: 20, c: 30 };
    
    update(target, toUpdate, { exclude: ['a', 'c'] });
    
    expect(target).toEqual({ a: 1, b: 20, c: 3 });
  });

  it('given same value in toUpdate for nested, when update, then no change to target', () => {
    const target = { a: 1, b: { c: 2 } };
    const toUpdate = { b: { c: 2 } };
    
    update(target, toUpdate);
    
    expect(target).toEqual({ a: 1, b: { c: 2 } });
  });

  it('given empty toUpdate, when update, then target unchanged', () => {
    const target = { a: 1, b: 2 };
    
    update(target, {});
    
    expect(target).toEqual({ a: 1, b: 2 });
  });

  it('given toUpdate null, when update, then target unchanged (graceful)', () => {
    const target = { a: 1, b: 2 };
    
    update(target, null as any); // Pass null to simulate invalid input
    
    expect(target).toEqual({ a: 1, b: 2 });
  });

  it('given deep 3 levels toUpdate, when update, then deep leaf updated', () => {
    const target = { a: 1, b: { c: { d: 4 } } };
    const toUpdate = { b: { c: { d: 40 } } };
    
    update(target, toUpdate);
    
    expect(target).toEqual({ a: 1, b: { c: { d: 40 } } });
  });
});
