import { afterEach, describe, expect, it, vi } from 'vitest';
import { Client, cacheExchange, fetchExchange, gql, ssrExchange } from '@urql/core';
import { createApiAgent, createQueryCache, useMutation, useQuery } from '../../src/api';
import { createUrqlAdapter } from '../../src/api/urql';

vi.mock('../../src/envs', () => ({ isBrowser: true, isServer: false }));

const Users = gql`query Users($offset: Int, $limit: Int, $search: String) { users(offset: $offset, limit: $limit, search: $search) { id name } }`;
const Update = gql`mutation Update($id: ID!, $name: String!) { updateUser(id: $id, name: $name) { id name } }`;
const disposers: (() => void)[] = [];
afterEach(() => { disposers.splice(0).forEach(dispose => dispose()); vi.restoreAllMocks(); vi.useRealTimers(); });

function setup(payload: unknown = { data: { users: [{ id: '1', name: 'Nico', __typename: 'User' }] } }) {
  const fetch = vi.fn(async () => new Response(JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } }));
  const adapter = createUrqlAdapter({ endpoint: '/graphql', clientOptions: { fetch } });
  disposers.push(() => adapter.resetForSSR());
  const queryCache = createQueryCache();
  const api = createApiAgent({ queryCache, gql: adapter });
  return { fetch, adapter, queryCache, api };
}

function body(fetch: ReturnType<typeof vi.fn>, index = 0) {
  const [url, options] = fetch.mock.calls[index];
  return options.body ? JSON.parse(options.body) : { variables: JSON.parse(new URL(url, 'http://localhost').searchParams.get('variables')!) };
}

describe('given optional urql agents, when executing GraphQL operations, then transport and shared cache behavior work together', () => {
  it('given page options and explicit variables, when querying twice, then pagination is unchanged and urql serves the cache hit', async () => {
    const { api, fetch, adapter } = setup();
    const first = await api.query(Users, { page: 3, limit: 10, variables: { search: 'Nico' } });
    await api.query(Users, { page: 3, limit: 10, variables: { search: 'Nico' } });
    expect(first.data.users[0].name).toBe('Nico');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(body(fetch).variables).toEqual({ offset: 20, limit: 10, search: 'Nico' });
    expect(api.gql?.urql).toBe(adapter.urql);
    await api.query(Users, { page: 3, limit: 10, variables: { offset: 7, limit: 4 } });
    expect(body(fetch, 1).variables).toEqual({ offset: 7, limit: 4 });
  });

  it('given no variables or page, when querying, then no pagination variables are generated', async () => {
    const { api, fetch } = setup();
    await api.query(Users);
    expect(body(fetch).variables).toEqual({});
  });

  it('given agent auth and operation context, when querying, then token and header precedence and credentials reach fetch', async () => {
    const { adapter, fetch } = setup();
    const token = vi.fn(async () => ({ Authorization: 'Bearer refreshed' }));
    const api = createApiAgent({ gql: adapter, headers: { 'X-Agent': 'agent' }, withCredentials: true, onGetValidToken: token });
    await api.query(Users, { context: { fetchOptions: { headers: { Authorization: 'Bearer override', 'X-Call': 'call' } } } });
    const config = (fetch.mock.calls as any)[0][1];
    expect(new Headers(config.headers).get('Authorization')).toBe('Bearer override');
    expect(new Headers(config.headers).get('X-Agent')).toBe('agent');
    expect(config.credentials).toBe('include');
    expect(token).toHaveBeenCalledTimes(1);
  });

  it('given a supplied client and endpoint override, when querying different endpoints, then results do not collide', async () => {
    const fetch = vi.fn(async (url: string) => new Response(JSON.stringify({ data: { users: [{ id: url, name: new URL(url, 'http://localhost').pathname }] } }), { headers: { 'Content-Type': 'application/json' } }));
    const urql = new Client({ url: '/original', exchanges: [cacheExchange, fetchExchange], fetch });
    const api = createApiAgent({ gql: createUrqlAdapter({ urql, endpoint: '/override' }) });
    expect((await api.query(Users)).data.users[0].name).toBe('/override');
    expect((await api.query(Users, { context: { url: '/other' } })).data.users[0].name).toBe('/other');
    expect((await api.query(Users)).data.users[0].name).toBe('/override');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('given a cached query and invalidation, when querying again, then a fresh network result is used', async () => {
    const { api, fetch, queryCache } = setup();
    await api.query(Users, { queryKey: ['users', 1] });
    queryCache.invalidateQuery(['users']);
    await api.query(Users, { queryKey: ['users', 1] });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('given a partial GraphQL error, when queried through a hook, then data and error and extensions are preserved', async () => {
    const { api } = setup({ data: { users: [] }, errors: [{ message: 'Partial failure' }], extensions: { trace: 'abc' } });
    const query = useQuery({ fn: () => api.query(Users), immediate: false });
    disposers.push(query.dispose);
    await query.fetch();
    expect(query.data).toEqual({ users: [] });
    expect(query.isError).toBe(true);
    expect(query.error.message).toContain('Partial failure');
    expect(query.extensions).toEqual({ trace: 'abc' });
  });

  it('given a live hook and automatic invalidation refresh, when fresh data arrives, then the hook updates and disposal stops updates', async () => {
    const { api, fetch, queryCache } = setup();
    const query = useQuery({ fn: () => api.query(Users, { queryKey: ['users'], fetchOnInvalidate: true }), immediate: false });
    disposers.push(query.dispose);
    await query.fetch();
    fetch.mockImplementation(async () => new Response(JSON.stringify({ data: { users: [{ id: '1', name: 'New', __typename: 'User' }] } }), { headers: { 'Content-Type': 'application/json' } }));
    queryCache.invalidateQuery(['users']);
    await vi.waitFor(() => expect((query.data as any).users[0].name).toBe('New'));
    query.dispose();
    fetch.mockImplementation(async () => new Response(JSON.stringify({ data: { users: [] } }), { headers: { 'Content-Type': 'application/json' } }));
    await api.query(Users, { queryKey: ['users'], context: { requestPolicy: 'network-only' } });
    expect((query.data as any).users[0].name).toBe('New');
  });

  it('given a mutation hook, when created then explicitly executed, then only execution triggers the mutation and success invalidation', async () => {
    const { api, fetch, queryCache } = setup({ data: { updateUser: { id: '1', name: 'Updated' } } });
    const success = vi.fn(cache => cache?.invalidateQuery(['users']));
    const mutation = useMutation({ fn: () => api.mutation(Update, { variables: { id: '1', name: 'Updated' }, onSuccess: success }) });
    expect(fetch).not.toHaveBeenCalled();
    await mutation.mutate();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledWith(queryCache, expect.objectContaining({ data: { updateUser: { id: '1', name: 'Updated' } } }));
  });

  it('given a mutation returning partial errors, when executed, then it resolves and calls error callbacks without success callbacks', async () => {
    const { api } = setup({ data: { updateUser: null }, errors: [{ message: 'Denied' }], extensions: { code: 4 } });
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const hookSuccess = vi.fn();
    const mutation = useMutation({ fn: () => api.mutation(Update, { variables: { id: '1', name: 'N' }, onSuccess, onError }), onSuccess: hookSuccess });
    await mutation.mutate();
    expect(mutation.data).toEqual({ updateUser: null });
    expect(mutation.error.message).toContain('Denied');
    expect(mutation.extensions).toEqual({ code: 4 });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(hookSuccess).not.toHaveBeenCalled();
  });

  it('given clients sharing an endpoint, when registering them, then unique stable keys are required', () => {
    const queryCache = createQueryCache();
    const first = createUrqlAdapter({ endpoint: '/graphql' });
    createApiAgent({ queryCache, gql: first });
    expect(() => createApiAgent({ queryCache, gql: first })).not.toThrow();
    expect(() => createApiAgent({ queryCache, gql: createUrqlAdapter({ endpoint: '/graphql' }) })).toThrow('Duplicate GraphQL adapter key');
    expect(() => createApiAgent({ queryCache, gql: createUrqlAdapter({ endpoint: '/graphql', key: 'other' }) })).not.toThrow();
  });

  it('given a browser hydration script before agent registration, when the first query runs, then urql replays data and extensions without a network request', async () => {
    const capture = ssrExchange({ isClient: false, includeExtensions: true });
    const fetch = vi.fn(async () => new Response(JSON.stringify({ data: { users: [] }, extensions: { trace: 'ssr' } }), { headers: { 'Content-Type': 'application/json' } }));
    const client = new Client({ url: '/hydrated', exchanges: [cacheExchange, capture, fetchExchange], fetch });
    const sourceCache = createQueryCache();
    const server = createApiAgent({ queryCache: sourceCache, gql: createUrqlAdapter({ urql: client, ssr: capture }) });
    await server.query(Users);
    const snapshot = await sourceCache.dehydrate();
    const script = document.createElement('script');
    script.id = '__API_DEHYDRATED__';
    script.type = 'application/json';
    script.textContent = snapshot;
    document.body.appendChild(script);
    try {
      const browserCache = createQueryCache();
      const api = createApiAgent({ queryCache: browserCache, gql: createUrqlAdapter({ endpoint: '/hydrated', clientOptions: { fetch } }) });
      const result = await api.query(Users);
      expect(result.data).toEqual({ users: [] });
      expect(result.extensions).toEqual({ trace: 'ssr' });
      expect(fetch).toHaveBeenCalledTimes(1);
    } finally { script.remove(); }
  });

  it('given passive expiration, when cache hits occur before expiration, then they do not extend the freshness window', async () => {
    const { api, fetch } = setup();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(10000);
    await api.query(Users, { expireIn: '1s' });
    vi.setSystemTime(10500);
    await api.query(Users, { expireIn: '1s' });
    expect(fetch).toHaveBeenCalledTimes(1);
    vi.setSystemTime(11100);
    await api.query(Users, { expireIn: '1s' });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('given a failed authorization response, when urql returns its error, then the agent unauthorized callback runs', async () => {
    const unauthorized = vi.fn();
    const fetch = vi.fn(async () => new Response(JSON.stringify({ errors: [{ message: 'Unauthorized' }] }), { status: 401, headers: { 'Content-Type': 'application/json' } }));
    const api = createApiAgent({ gql: createUrqlAdapter({ endpoint: '/private', clientOptions: { fetch } }), onUnauthorizedResponse: unauthorized });
    const result = await api.query(Users);
    expect(result.error).toBeDefined();
    expect(unauthorized).toHaveBeenCalledTimes(1);
  });

  it('given a direct urql cache update, when an agent hook observes the same query, then it receives the update', async () => {
    const { api, fetch } = setup();
    const query = useQuery({ fn: () => api.query(Users), immediate: false });
    disposers.push(query.dispose);
    await query.fetch();
    fetch.mockImplementation(async () => new Response(JSON.stringify({ data: { users: [] } }), { headers: { 'Content-Type': 'application/json' } }));
    await api.gql!.urql.query(Users, {}, { requestPolicy: 'network-only' }).toPromise();
    await vi.waitFor(() => expect(query.data).toEqual({ users: [] }));
  });

  it('given a REST-only agent, when invoking GraphQL, then a clear configuration error is returned', async () => {
    await expect(createApiAgent().query(Users)).rejects.toThrow('gql adapter');
  });
});
