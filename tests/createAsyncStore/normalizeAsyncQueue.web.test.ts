import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAsyncStore } from '../../src/createAsyncStore';
import { normalizeAsyncQueue } from '../../src/createAsyncStore/normalizeAsyncQueue';
import { AsyncStore } from '../../src/createAsyncStore/types';

describe('normalizeAsyncQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const name = 'testStore';

  it('should handle a single promise', async () => {
    const singlePromise = Promise.resolve('done');
    const result = normalizeAsyncQueue(singlePromise);
    expect(result).toEqual([singlePromise]);
  });

  it('should handle an array of promises', async () => {
    const promise1 = Promise.resolve('done1');
    const promise2 = Promise.resolve('done2');
    const [ result1, result2 ] = await Promise.all(normalizeAsyncQueue([ promise1, promise2 ]));
    expect(result1).toBe('done1');
    expect(result2).toBe('done2');
  });

  it('should handle an array of functions returning promises', async () => {
    const promiseFunc1 = vi.fn(() => new Promise(resolve => resolve('done1')));
    const promiseFunc2 = vi.fn(() => new Promise(resolve => resolve('done2')));
    const result = normalizeAsyncQueue([promiseFunc1, promiseFunc2]);
    expect(result.length).toBe(2);
    expect(result[0]).toBeInstanceOf(Promise);
    expect(result[1]).toBeInstanceOf(Promise);
    await expect(result[0]).resolves.toBe('done1');
    await expect(result[1]).resolves.toBe('done2');
  });

  it('should handle an async store that is ready', async () => {
    const store = createAsyncStore<AsyncStore<any>>({ name });
    store.setStoreReady();
    store.init = vi.fn();
    
    const result = await Promise.all(normalizeAsyncQueue(store));
    expect(result[0]).toBe(true);
    expect(store.init).not.toHaveBeenCalled();
  });

  it('should handle an async store that is not ready', async () => {
    const store = createAsyncStore<AsyncStore<any>>({ name });
    store.init = vi.fn();
    
    const result = normalizeAsyncQueue(store);

    expect(result[0]).toBeInstanceOf(Promise);
    expect(store.init).toBeCalledTimes(1);
  });

  it('should handle a mixed array of promises, functions, and async stores', async () => {
    const promise1 = Promise.resolve('done1');
    const promiseFunc = vi.fn(() => new Promise(resolve => resolve('done2')));
    const store = createAsyncStore<AsyncStore<any>>({ name });
    store.setStoreReady();
    store.init = vi.fn();

    const result = normalizeAsyncQueue([promise1, promiseFunc, store]);
    expect(result.length).toBe(3);
    expect(result[0]).toBe(promise1);
    expect(result[1]).toBeInstanceOf(Promise);
    expect(result[2]).toBe(store.isReady);

    await expect(result[0]).resolves.toBe('done1');
    await expect(result[1]).resolves.toBe('done2');
    await expect(result[2]).resolves.toBe(true);
  });

  it('should return the same promise if input is already a promise', async () => {
    const promise = Promise.resolve('done');
    const result = normalizeAsyncQueue(promise);
    expect(result).toEqual([promise]);
    await expect(result[0]).resolves.toBe('done');
  });
});
