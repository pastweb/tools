import { describe, it, expect, vi } from 'vitest';
import { memo, getKey } from '../../src/memo/memo';
import { isType, type MemoCallback } from '../../src';

describe('given the memo function', () => {
  it('given memo(() => 1+1), when assigned, then typeof memorized is function', () => {
    const memorized = memo(() => 1 + 1);
    expect(typeof memorized).toBe('function');
  });

  it('given memorized, after call, then (memorized as any).cache is a Map (via isType)', () => {
    const memorized = memo(() => 1 + 1);
    expect(memorized()).toBe(2);
    expect(isType('Map', (memorized as any).cache)).toBe(true);
  });

  it('given cache with [] key, when getKey(cache, []), then returns the same args key ref', () => {
    const cache = new Map<any[], any>();
    const args: any[] = [];
    cache.set(args, 2);
    expect(getKey(cache, [])).toStrictEqual(args);
  });

  it('given cache with [1] key, when getKey(cache, [1]), then returns the same args key ref', () => {
    const cache = new Map<any[], any>();
    const args: any[] = [1];
    cache.set(args, 2);
    expect(getKey(cache, [1])).toStrictEqual(args);
  });

  it('given cached value for [], when getKey and lookup, then cache.get(key) === 2', () => {
    const cache = new Map<any[], any>();
    const args: any[] = [];
    cache.set(args, 2);
    const key = getKey(cache, []) as any[];
    expect(cache.get(key)).toBe(2);
  });

  it('given memorized call, when inspect cache via getKey([]), then cache.has(key) true', () => {
    const memorized = memo(() => 1 + 1);
    expect(memorized()).toBe(2);
    const cache: Map<any[], any> = (memorized as any).cache;
    const key = getKey(cache, []) as any[];
    expect(cache.has(key)).toBe(true);
  });

  it('given vi.fn wrapped in memo, when call twice with same arg, then fn calledTimes===1 and both return same', () => {
    
    const func = vi.fn((a:number) => a + 1) as unknown;
    const memorized = memo(func as MemoCallback);

    expect(memorized(1)).toBe(2);
    expect(memorized(1)).toBe(2);
    expect(func).toBeCalledTimes(1);
  });
});
