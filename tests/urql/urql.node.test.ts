import { describe, expect, it, vi } from 'vitest';
import { Client, cacheExchange, fetchExchange } from '@urql/core';
import { createApiAgent, createQueryCache, sliceDehydratedState } from '../../src/api';
import { createUrqlAdapter } from '../../src/api/urql';
import { runSSRCycle } from '../../src/ssrUtils/runSSRCycle';

const Document = 'query Users { users { id name } }';
function adapter(endpoint: string) {
  const fetch = vi.fn(async () => new Response(JSON.stringify({ data: { users: [{ id: endpoint, name: endpoint }] }, extensions: { endpoint } }), { headers: { 'Content-Type': 'application/json' } }));
  return { gql: createUrqlAdapter({ endpoint, clientOptions: { fetch } }), fetch };
}

describe('given multiple GraphQL agents sharing an SSR cache, when collecting and hydrating, then clients remain isolated', () => {
  it('given two endpoints, when running SSR, then queries prefetch once each and final render has data', async () => {
    const queryCache = createQueryCache();
    const first = adapter('/first');
    const second = adapter('/second');
    const a = createApiAgent({ queryCache, gql: first.gql });
    const b = createApiAgent({ queryCache, gql: second.gql });
    const result = await runSSRCycle({ queryCache, route: '/', shouldAttemptStatic: true, render: async () => {
      const [one, two] = await Promise.all([a.query(Document), b.query(Document)]);
      return JSON.stringify([one.data, two.data]);
    } });
    expect(first.fetch).toHaveBeenCalledTimes(1);
    expect(second.fetch).toHaveBeenCalledTimes(1);
    expect(result.html).toContain('/first');
    expect(result.html).toContain('/second');
    expect(result.isStatic).toBe(true);
    expect(Object.keys(JSON.parse(result.snapshot!).adapters)).toEqual(['/first', '/second']);
    expect(result.trackerSnapshot.dependencies).toHaveLength(2);
  });

  it('given a pending snapshot, when agents register in reverse order, then each receives its matching data and extensions without fetching', async () => {
    const cache = createQueryCache();
    const first = adapter('/first');
    const second = adapter('/second');
    const a = createApiAgent({ queryCache: cache, gql: first.gql });
    const b = createApiAgent({ queryCache: cache, gql: second.gql });
    await a.query(Document); await b.query(Document);
    const snapshot = await cache.dehydrate();
    const restored = createQueryCache();
    restored.hydrate(snapshot);
    const newSecond = adapter('/second');
    const newFirst = adapter('/first');
    const rb = createApiAgent({ queryCache: restored, gql: newSecond.gql });
    const ra = createApiAgent({ queryCache: restored, gql: newFirst.gql });
    expect((await ra.query(Document)).data.users[0].name).toBe('/first');
    expect((await rb.query(Document)).extensions).toEqual({ endpoint: '/second' });
    expect(newFirst.fetch).not.toHaveBeenCalled();
    expect(newSecond.fetch).not.toHaveBeenCalled();
  });

  it('given a previous SSR request, when resetting, then the client is replaced and data is fetched again', async () => {
    const queryCache = createQueryCache();
    const { gql, fetch } = adapter('/graphql');
    const api = createApiAgent({ queryCache, gql });
    await api.query(Document); await queryCache.dehydrate();
    const old = api.gql!.urql;
    queryCache.resetForSSR();
    expect(api.gql!.urql).not.toBe(old);
    await api.query(Document); await queryCache.dehydrate();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('given no-store and static queries, when dehydrating, then no-store results are excluded and slices include only matching operations', async () => {
    const queryCache = createQueryCache();
    const { gql } = adapter('/graphql');
    const api = createApiAgent({ queryCache, gql });
    await api.query(Document, { queryKey: ['users'] });
    await api.query('query Secret { secret }', { queryKey: ['secret'], ssrMode: 'no-store' });
    const snapshot = await queryCache.dehydrate();
    const data = JSON.parse(snapshot).adapters['/graphql'];
    expect(Object.keys(data.entries)).toEqual(['["users"]']);
    expect(Object.keys(data.operations)).toHaveLength(1);
    const slice = JSON.parse(sliceDehydratedState(snapshot, [['users']]));
    expect(slice.adapters['/graphql'].operations).toEqual(data.operations);
    expect(JSON.parse(sliceDehydratedState(snapshot, [['other']])).adapters).toEqual({});
  });

  it('given legacy REST state and a GraphQL adapter, when dehydrating and hydrating, then both states survive in one snapshot', async () => {
    const queryCache = createQueryCache();
    queryCache.hydrate(JSON.stringify({ '/rest': ['/rest', {}, false, { data: [1], status: 200, headers: {}, config: {} }, 123, '', '', '', false, false] }));
    const api = createApiAgent({ queryCache, gql: adapter('/graphql').gql });
    await api.query(Document);
    const snapshot = await queryCache.dehydrate();
    const target = createQueryCache();
    target.hydrate(snapshot);
    expect(target.get('/rest')?.response.data).toEqual([1]);
    expect(Object.keys(JSON.parse(snapshot).adapters)).toEqual(['/graphql']);
    const restSlice = JSON.parse(sliceDehydratedState(snapshot, ['/rest']));
    expect(restSlice.queries['/rest'][3].data).toEqual([1]);
  });

  it('given a custom client factory, when SSR resets, then a fresh client with matching SSR exchange is created', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({ data: { users: [] } }), { headers: { 'Content-Type': 'application/json' } }));
    const factory = vi.fn(ssr => new Client({ url: '/factory', exchanges: [cacheExchange, ssr, fetchExchange], fetch }));
    const queryCache = createQueryCache();
    const api = createApiAgent({ queryCache, gql: createUrqlAdapter({ createClient: factory }) });
    queryCache.resetForSSR();
    await api.query(Document); await queryCache.dehydrate();
    expect(factory).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('given partial errors during prefetch, when hydrating, then error objects and extensions survive serialization', async () => {
    const queryCache = createQueryCache();
    const fetch = vi.fn(async () => new Response(JSON.stringify({ data: { users: null }, errors: [{ message: 'Unavailable' }], extensions: { trace: 7 } }), { headers: { 'Content-Type': 'application/json' } }));
    const gql = createUrqlAdapter({ endpoint: '/errors', clientOptions: { fetch } });
    const api = createApiAgent({ queryCache, gql });
    await api.query(Document);
    const snapshot = await queryCache.dehydrate();
    const newCache = createQueryCache();
    newCache.hydrate(snapshot);
    const restored = createApiAgent({ queryCache: newCache, gql: createUrqlAdapter({ endpoint: '/errors', clientOptions: { fetch } }) });
    const result = await restored.query(Document);
    expect(result.data).toEqual({ users: null });
    expect(result.error?.message).toContain('Unavailable');
    expect(result.extensions).toEqual({ trace: 7 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
