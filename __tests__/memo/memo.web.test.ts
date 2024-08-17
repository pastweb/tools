import { memo, getKey } from '../../src/memo/memo';
import { isType, type MemoCallback } from '../../src';

describe('memo', () => {
  it('the memorized should be a function', () => {
    const memorized = memo(() => 1 + 1);
    expect(typeof memorized).toBe('function');
  });

  it('the cache should be a Map', () => {
    const memorized = memo(() => 1 + 1);
    expect(memorized()).toBe(2);
    expect(isType('Map', (memorized as any).cache)).toBe(true);
  });

  it('getKey - should recrive the corrent data for 0 args[]', () => {
    const cache = new Map<any[], any>();
    const args: any[] = [];
    cache.set(args, 2);
    expect(getKey(cache, [])).toStrictEqual(args);
  });

  it('getKey - should recrive the corrent data for 1 args[]', () => {
    const cache = new Map<any[], any>();
    const args: any[] = [1];
    cache.set(args, 2);
    expect(getKey(cache, [1])).toStrictEqual(args);
  });

  it('getKey - should recrive the corrent Map value', () => {
    const cache = new Map<any[], any>();
    const args: any[] = [];
    cache.set(args, 2);
    const key = getKey(cache, []) as any[];
    expect(cache.get(key)).toBe(2);
  });

  it('the cached value should be present', () => {
    const memorized = memo(() => 1 + 1);
    expect(memorized()).toBe(2);
    const cache: Map<any[], any> = (memorized as any).cache;
    const key = getKey(cache, []) as any[];
    expect(cache.has(key)).toBe(true);
  });

  it('the function should be called just once', () => {
    
    const func = jest.fn((a:number) => a + 1) as unknown;
    const memorized = memo(func as MemoCallback);

    expect(memorized(1)).toBe(2);
    expect(memorized(1)).toBe(2);
    expect(func).toBeCalledTimes(1);
  });
});
