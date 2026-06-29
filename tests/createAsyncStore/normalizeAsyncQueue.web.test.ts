import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAsyncStore } from '../../src/createAsyncStore';
import { normalizeAsyncQueue } from '../../src/createAsyncStore/normalizeAsyncQueue';
import { AsyncStore } from '../../src/createAsyncStore/types';

describe('given the normalizeAsyncQueue helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const name = 'testStore';

  it('given a single promise, when normalizeAsyncQueue is called, then it returns an array containing that promise', async () => {
    const singlePromise = Promise.resolve('done');
    const result = normalizeAsyncQueue(singlePromise);
    expect(result).toEqual([singlePromise]);
  });

  it('given an array of promises, when normalizeAsyncQueue is called, then it returns an array of the same promises and they resolve correctly', async () => {
    const promise1 = Promise.resolve('done1');
    const promise2 = Promise.resolve('done2');
    const [ result1, result2 ] = await Promise.all(normalizeAsyncQueue([ promise1, promise2 ]));
    expect(result1).toBe('done1');
    expect(result2).toBe('done2');
  });

  it('given an array of functions that return promises, when normalizeAsyncQueue is called, then it returns an array of promises and they resolve to the expected values', async () => {
    const promiseFunc1 = vi.fn(() => new Promise(resolve => resolve('done1')));
    const promiseFunc2 = vi.fn(() => new Promise(resolve => resolve('done2')));
    const result = normalizeAsyncQueue([promiseFunc1, promiseFunc2]);
    expect(result.length).toBe(2);
    expect(result[0]).toBeInstanceOf(Promise);
    expect(result[1]).toBeInstanceOf(Promise);
    await expect(result[0]).resolves.toBe('done1');
    await expect(result[1]).resolves.toBe('done2');
  });

  it('given a ready async store (isStoreReady true), when normalizeAsyncQueue is called on it, then the result is [true] and init is not called', async () => {
    const store = createAsyncStore<AsyncStore<any>>({ name });
    store.setStoreReady();
    store.init = vi.fn();
    
    const result = await Promise.all(normalizeAsyncQueue(store));
    expect(result[0]).toBe(true);
    expect(store.init).not.toHaveBeenCalled();
  });

  it('given a not-ready async store, when normalizeAsyncQueue is called on it, then the result contains its isReady promise and init is called once', async () => {
    const store = createAsyncStore<AsyncStore<any>>({ name });
    store.init = vi.fn();
    
    const result = normalizeAsyncQueue(store);

    expect(result[0]).toBeInstanceOf(Promise);
    expect(store.init).toBeCalledTimes(1);
  });

  it('given a mixed array of promise, promise-fn and ready async store, when normalizeAsyncQueue is called, then it normalizes each correctly into the result array', async () => {
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

  it('given a promise input, when normalizeAsyncQueue is called, then it returns an array with the same promise instance', async () => {
    const promise = Promise.resolve('done');
    const result = normalizeAsyncQueue(promise);
    expect(result).toEqual([promise]);
    await expect(result[0]).resolves.toBe('done');
  });
});
