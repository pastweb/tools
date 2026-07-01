import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createQueryCache } from '../../src/api/createQueryCache';
import type { AxiosInstance } from 'axios';

vi.mock('../../src/envs', () => ({
  isServer: false,
  isBrowser: true,
}));

describe('given createQueryCache fetchOnExpired and removeOnExpired in the browser', () => {
  let mockAgent: AxiosInstance;

  beforeEach(() => {
    vi.useFakeTimers();
    mockAgent = {
      get: vi.fn()
        .mockResolvedValueOnce({ data: { v: 1 }, status: 200, statusText: 'OK', headers: {}, config: {} })
        .mockResolvedValueOnce({ data: { v: 2 }, status: 200, statusText: 'OK', headers: {}, config: {} }),
    } as any;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('given fetchOnExpired as duration string, when time advances past expireIn, then agent.get is called again automatically', async () => {
    const cache = createQueryCache();
    await cache.set('/auto', mockAgent, { expireIn: '1s', fetchOnExpired: '1s' });
    expect(mockAgent.get).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1001);
    await vi.advanceTimersByTimeAsync(0);

    expect(mockAgent.get).toHaveBeenCalledTimes(2);
    expect(cache.get('/auto')?.response.data).toEqual({ v: 2 });
  });

  it('given fetchOnExpired true (passive), when time advances, then no automatic refetch occurs', async () => {
    const passiveAgent = {
      get: vi.fn().mockResolvedValue({ data: { v: 1 }, status: 200, statusText: 'OK', headers: {}, config: {} }),
    } as any;
    const cache = createQueryCache();

    await cache.set('/passive', passiveAgent, { expireIn: '1s', fetchOnExpired: true });
    expect(passiveAgent.get).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5000);
    await vi.advanceTimersByTimeAsync(0);
    expect(passiveAgent.get).toHaveBeenCalledTimes(1);
  });

  it('given removeOnExpired true, when time advances past expireIn, then the cache entry is removed', async () => {
    const cache = createQueryCache();
    await cache.set('/temp', mockAgent, { expireIn: '1s', removeOnExpired: true });
    expect(cache.has('/temp')).toBe(true);

    vi.advanceTimersByTime(1001);
    await vi.advanceTimersByTimeAsync(0);

    expect(cache.has('/temp')).toBe(false);
  });

  it('given refetchOnWindowFocus true and an expired entry with a checker, when window focus fires, then checker runs and agent.get is called again', async () => {
    const focusAgent = {
      get: vi.fn()
        .mockResolvedValueOnce({ data: { n: 1 }, status: 200, statusText: 'OK', headers: {}, config: {} })
        .mockResolvedValueOnce({ data: { n: 2 }, status: 200, statusText: 'OK', headers: {}, config: {} }),
    } as any;

    const cache = createQueryCache({ refetchOnWindowFocus: true });
    await cache.set('/focus', focusAgent, { expireIn: '1s', fetchOnExpired: '5s' });
    expect(focusAgent.get).toHaveBeenCalledTimes(1);

    const entry = cache.get('/focus') as any;
    entry.timestamp = Date.now() - 2000;

    window.dispatchEvent(new Event('focus'));
    await Promise.resolve();

    expect(focusAgent.get).toHaveBeenCalledTimes(2);
    expect(cache.get('/focus')?.response.data).toEqual({ n: 2 });
  });

  it('given refetchOnWindowFocus false (default), when window focus fires, then no checker is invoked', async () => {
    const agent = {
      get: vi.fn().mockResolvedValue({ data: { x: 1 }, status: 200, statusText: 'OK', headers: {}, config: {} }),
    } as any;

    const cache = createQueryCache();
    await cache.set('/no-focus', agent, { expireIn: '1s', fetchOnExpired: '5s' });

    const entry = cache.get('/no-focus') as any;
    entry.timestamp = Date.now() - 2000;

    window.dispatchEvent(new Event('focus'));
    await vi.advanceTimersByTimeAsync(0);

    expect(agent.get).toHaveBeenCalledTimes(1);
  });

  it('given refetchOnReconnect true and an expired entry with a checker, when browser goes online, then checker runs and agent.get is called again', async () => {
    const reconnectAgent = {
      get: vi.fn()
        .mockResolvedValueOnce({ data: { n: 1 }, status: 200, statusText: 'OK', headers: {}, config: {} })
        .mockResolvedValueOnce({ data: { n: 2 }, status: 200, statusText: 'OK', headers: {}, config: {} }),
    } as any;

    const cache = createQueryCache({ refetchOnReconnect: true });
    await cache.set('/reconnect', reconnectAgent, { expireIn: '1s', fetchOnExpired: '5s' });
    expect(reconnectAgent.get).toHaveBeenCalledTimes(1);

    const entry = cache.get('/reconnect') as any;
    entry.timestamp = Date.now() - 2000;

    window.dispatchEvent(new Event('online'));
    await Promise.resolve();

    expect(reconnectAgent.get).toHaveBeenCalledTimes(2);
    expect(cache.get('/reconnect')?.response.data).toEqual({ n: 2 });
  });

  it('given invalidateQueries with multiple keys, when called, then each key is invalidated through invalidateQuery semantics', async () => {
    const agentA = {
      get: vi.fn().mockResolvedValue({ data: { a: 1 }, status: 200, statusText: 'OK', headers: {}, config: {} }),
    } as any;
    const agentB = {
      get: vi.fn().mockResolvedValue({ data: { b: 1 }, status: 200, statusText: 'OK', headers: {}, config: {} }),
    } as any;
    const agentC = {
      get: vi.fn().mockResolvedValue({ data: { c: 1 }, status: 200, statusText: 'OK', headers: {}, config: {} }),
    } as any;
    const cache = createQueryCache();

    await cache.set('/a', agentA, { queryKey: ['a'] });
    await cache.set('/b', agentB, { queryKey: ['b'] });
    await cache.set('/c', agentC, { queryKey: ['c'] });

    cache.invalidateQueries([['a'], ['b']]);

    expect(cache.get('["a"]')?.invalid).toBe(true);
    expect(cache.get('["b"]')?.invalid).toBe(true);
    expect(cache.get('["c"]')?.invalid).toBe(false);
  });

  it('given fetchOnInvalidate as duration string, when invalidateQuery runs, then refetch happens after the delay', async () => {
    const delayedAgent = {
      get: vi.fn()
        .mockResolvedValueOnce({ data: { step: 1 }, status: 200, statusText: 'OK', headers: {}, config: {} })
        .mockResolvedValueOnce({ data: { step: 2 }, status: 200, statusText: 'OK', headers: {}, config: {} }),
    } as any;
    const cache = createQueryCache();
    await cache.set('/delayed', delayedAgent, { expireIn: '5m', fetchOnInvalidate: '2s' });

    cache.invalidateQuery('/delayed');
    expect(delayedAgent.get).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2001);
    await vi.advanceTimersByTimeAsync(0);

    expect(delayedAgent.get).toHaveBeenCalledTimes(2);
  });
});
