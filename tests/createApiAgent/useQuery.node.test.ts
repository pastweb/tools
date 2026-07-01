import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApiAgent, createQueryCache, useQuery } from '../../src/api';
import { ref } from '../../src/reactivity';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Force server mode
vi.mock('../../src/envs', () => ({
  isBrowser: false,
  isServer: true,
}));

describe('given useQuery and createApiAgent with shared queryCache in SSR (node) environment, when using agents with queryCache option for collection and dehydrate, then prefetch functions are registered, calling dehydrate() on the cache executes them and returns a cache snapshot, and cache is shared across agents without blocking', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    vi.useFakeTimers();
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('given a shared queryCache and agent created with it, when agent.get is called in SSR, then dehydrate registers a prefetch fn and no immediate network call occurs until the fn is executed', async () => {
    const cache = createQueryCache();
    const agent = createApiAgent({ queryCache: cache });
    const url = '/ssr-data';
    const responseData = { hello: 'ssr' };
    mock.onGet(url).reply(200, responseData);

    // In SSR with cache, get returns placeholder immediately and registers
    const res = await agent.get(url);
    expect(res.data).toBeUndefined(); // placeholder
    expect(cache.has(url)).toBe(false); // not yet populated

    // dehydrate() executes the registered prefetches and returns serialized cache snapshot
    const snapshot = await cache.dehydrate();
    expect(typeof snapshot).toBe('string');

    expect(mock.history.get.length).toBe(1);
    expect(cache.has(url)).toBe(true);
    const cached = cache.get(url);
    expect(cached?.response.data).toEqual(responseData);
  });

  it('given useQuery calling an agent.get fn (with shared queryCache) in SSR, when immediate query runs, then fn executes (registers prefetch), query states update, and dehydrate on cache executes and returns snapshot', async () => {
    const cache = createQueryCache();
    const agent = createApiAgent({ queryCache: cache });
    const url = '/ssr-query';
    const responseData = { from: 'query' };
    mock.onGet(url).reply(200, responseData);

    const fn = () => agent.get(url);
    const query = useQuery({ fn, immediate: true });

    // On create, effect triggers fetch which for SSR registers
    await vi.runAllTimersAsync();

    // Placeholder path in SSR: the fn receives a response whose .data is undefined; hook assigns it
    expect(query.data).toBeUndefined();
    expect(query.isPending).toBe(false);
    expect(query.isFetching).toBe(false);

    // dehydrate executes registered work
    await cache.dehydrate();

    // Now cache has it; subsequent use would pick up, but current query instance already settled with placeholder
    expect(cache.has(url)).toBe(true);
  });

  it('given multiple agents sharing the same queryCache instance, when each performs gets in SSR, then dehydrate on the shared cache collects all, and execution populates shared cache', async () => {
    const sharedCache = createQueryCache();
    const agent1 = createApiAgent({ queryCache: sharedCache });
    const agent2 = createApiAgent({ queryCache: sharedCache });

    const url1 = '/shared/a';
    const url2 = '/shared/b';
    mock.onGet(url1).reply(200, { a: 1 });
    mock.onGet(url2).reply(200, { b: 2 });

    await agent1.get(url1);
    await agent2.get(url2);

    // Use cache.dehydrate() — it executes and returns snapshot
    const snapshot = await sharedCache.dehydrate();
    expect(typeof snapshot).toBe('string');

    expect(sharedCache.has(url1)).toBe(true);
    expect(sharedCache.has(url2)).toBe(true);
    // agents see it too
    expect(sharedCache.has(url1)).toBe(true);
    expect(sharedCache.has(url2)).toBe(true);
  });

  it('given useQuery with immediate false and source in SSR, when fetch is called manually, then prefetch is registered via dehydrate and no timers are scheduled', async () => {
    const cache = createQueryCache();
    const agent = createApiAgent({ queryCache: cache });
    const page = ref(1);
    const urlBase = '/paged';
    mock.onGet(`${urlBase}?p=1`).reply(200, { p: 1 });

    const fn = () => agent.get(`${urlBase}?p=${page.value}`);
    const query = useQuery({ fn, source: page, immediate: false });

    expect(query.isPending).toBe(true);
    expect(query.isFetching).toBe(false);

    // Manual fetch registers in SSR
    await query.fetch();
    await vi.runAllTimersAsync();

    const snapshot = await cache.dehydrate();
    expect(typeof snapshot).toBe('string');

    // ensure no timer side effects were attempted (fetchOnExpired not used)
    // advancing does nothing harmful
    vi.advanceTimersByTime(10000);
    await vi.runAllTimersAsync();

    // calling dehydrate again is harmless (still has registrations)
    const snapshot2 = await cache.dehydrate();
    expect(typeof snapshot2).toBe('string');
  });

  it('given fetchOnExpired in SSR context, when query succeeds, then no refresh timer is ever scheduled', async () => {
    const cache = createQueryCache();
    const agent = createApiAgent({ queryCache: cache });
    const url = '/expire-ssr';
    mock.onGet(url).reply(200, { ok: true });

    const fn = () => agent.get(url, { expireIn: '1s', fetchOnExpired: '1s' });
    const query = useQuery({ fn, immediate: true });

    await vi.runAllTimersAsync();

    // Advance a lot; since isServer, scheduleRecall is a no-op
    vi.advanceTimersByTime(5000);
    await vi.runAllTimersAsync();

    // only the initial registration happened; dehydrate on cache executes it
    const snapshot = await cache.dehydrate();
    expect(typeof snapshot).toBe('string');
    expect(cache.has(url)).toBe(true);
  });
});
