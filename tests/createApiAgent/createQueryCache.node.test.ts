import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createQueryCache } from '../../src/api/createQueryCache';
import type { AxiosInstance } from 'axios';

let mockIsServer = false;

vi.mock('../../src/envs', () => ({
  isBrowser: false,
  get isServer() { return mockIsServer; },
}));

describe('given createQueryCache cache lifecycle options', () => {
  let mockAgent: AxiosInstance;

  beforeEach(() => {
    mockAgent = {
      get: vi.fn().mockResolvedValue({ data: { n: 1 }, status: 200, statusText: 'OK', headers: {}, config: {} }),
    } as any;
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockIsServer = false;
    vi.restoreAllMocks();
  });

  it('given fetchOnInvalidate true, when invalidateQuery is called, then agent.get is invoked again immediately', async () => {
    const cache = createQueryCache();
    await cache.set('/refetch', mockAgent, { expireIn: '5m', fetchOnInvalidate: true });
    expect(mockAgent.get).toHaveBeenCalledTimes(1);

    cache.invalidateQuery('/refetch');
    await Promise.resolve();

    expect(mockAgent.get).toHaveBeenCalledTimes(2);
    expect(cache.get('/refetch')?.invalid).toBe(false);
  });

  it('given removeOnInvalidate true, when invalidateQuery is called, then the entry is removed from the cache', async () => {
    const cache = createQueryCache();
    await cache.set('/gone', mockAgent, { removeOnInvalidate: true });
    expect(cache.has('/gone')).toBe(true);

    cache.invalidateQuery('/gone');

    expect(cache.has('/gone')).toBe(false);
  });

  it('given fetchOnExpired and fetchOnInvalidate options, when dehydrate then hydrate, then options are restored in the snapshot', async () => {
    const cache = createQueryCache();
    await cache.set('/opts', mockAgent, {
      expireIn: '2m',
      fetchOnExpired: '30s',
      fetchOnInvalidate: '1s',
      removeOnExpired: false,
      removeOnInvalidate: false,
    });

    const snapshot = await cache.dehydrate();
    const parsed = JSON.parse(snapshot);
    expect(parsed['/opts']).toEqual(expect.arrayContaining(['30s', '1s', false, false]));

    const fresh = createQueryCache();
    fresh.hydrate(snapshot);
    const restored = fresh.get('/opts');
    expect(restored?.fetchOnExpired).toBe('30s');
    expect(restored?.fetchOnInvalidate).toBe('1s');
  });

  it('given isServer true with fetchOnExpired string, when set then dehydrate, then prefetch runs without scheduling client timers', async () => {
    mockIsServer = true;
    const cache = createQueryCache();
    await cache.set('/ssr-exp', mockAgent, { expireIn: '1s', fetchOnExpired: '1s' });
    expect(mockAgent.get).not.toHaveBeenCalled();

    await cache.dehydrate();
    expect(mockAgent.get).toHaveBeenCalledTimes(1);
  });
});
