import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { createApiAgent, createQueryCache, useQuery, QueryData } from '../../src/api';
import { ref, computed } from '../../src/reactivity';

vi.mock('../../src/envs', () => ({
  isBrowser: true,
  isServer: false,
}));

describe('given useQuery with createApiAgent or plain fn, when using various immediate, source reactivity, initialData, fetch and error scenarios, then loading/fetching states, data, errors, placeholders and refetching behave correctly', () => {
  let mock: MockAdapter;
  let agent: ReturnType<typeof createApiAgent>;

  beforeEach(() => {
    agent = createApiAgent();
    mock = new MockAdapter(axios);
    vi.useFakeTimers();
  });

  afterEach(() => {
    mock.reset();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('given a query fn, when useQuery is initialized without immediate override, then isPending, isLoading, isFetching are true, isError false, data and error null, isPlaceholderData false', () => {
    const fn = vi.fn().mockResolvedValue({ data: { id: 1 } } as any);
    const query = useQuery({ fn });

    expect(query.status).toBe('pending');
    expect(query.fetchStatus).toBe('fetching');
    expect(query.responseStatus).toBe(null);
    expect(query.isPending).toBe(true);
    expect(query.isLoading).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isError).toBe(false);
    expect(query.data).toBe(null);
    expect(query.error).toBe(null);
    expect(query.isPlaceholderData).toBe(false);
  });

  it('given initialData, when useQuery created, then data is set to initialData, isPlaceholderData true, and fetch starts without pending/loading', () => {
    const initialData = { id: 0 };
    const fn = vi.fn().mockResolvedValue({ data: { id: 1 } } as any);
    const query = useQuery({ fn, initialData });

    expect(query.status).toBe('success');
    expect(query.fetchStatus).toBe('fetching');
    expect(query.data).toEqual(initialData);
    expect(query.isPlaceholderData).toBe(true);
    expect(query.isPending).toBe(false);
    expect(query.isLoading).toBe(false);
    expect(query.isFetching).toBe(true);
  });

  it('given immediate false, when useQuery is created, then status is pending but fetch status is idle and the fn was never called', async () => {
    const fn = vi.fn().mockResolvedValue({ data: { id: 1 } } as any);
    const query = useQuery({ fn, immediate: false });

    expect(query.status).toBe('pending');
    expect(query.fetchStatus).toBe('idle');
    expect(query.isPending).toBe(true);
    expect(query.isLoading).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(fn).not.toHaveBeenCalled();
  });

  it('given immediate true and caching agent, when useQuery created, then after timers pending and fetching become false, data is populated, cache has entry, and no error', async () => {
    const queryCache = createQueryCache();
    const agent = createApiAgent({ queryCache });
    const url = '/test';
    const responseData = { id: 1, name: 'test' };
    mock.onGet(url).reply(200, responseData);
    
    const fn = () => agent.get(url); // URL is used as cache key (no queryKey provided)
    const query = useQuery({ fn, immediate: true });

    expect(query.isPending).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.data).toBe(null);

    await vi.runAllTimersAsync();

    expect(queryCache.has(url)).toBe(true);
    expect(query.status).toBe('success');
    expect(query.fetchStatus).toBe('idle');
    expect(query.responseStatus).toBe(200);
    expect(query.isPending).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.data).toEqual(responseData);
    expect(query.isError).toBe(false);
    expect(query.error).toBe(null);
  });

  it('given an active query with cache, when cache invalidated and fn called again manually, then query data updates to new response from the independent call', async () => {
    const queryCache = createQueryCache();
    const agent = createApiAgent({ queryCache });
    const url = '/test';
    const responseData = { id: 1, name: 'test' };
    mock.onGet(url).reply(200, responseData);
    
    const fn = () => agent.get(url); // URL used as cache key
    const query = useQuery({ fn, immediate: true });

    expect(query.isPending).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.data).toBe(null);

    await vi.runAllTimersAsync();

    const data = queryCache.get(url) as QueryData;
    expect(data.onDataCallbacks.size).toBe(1);
    expect(queryCache.has(url)).toBe(true);
    expect(query.isPending).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.data).toEqual(responseData);
    expect(query.isError).toBe(false);
    expect(query.error).toBe(null);

    queryCache.invalidateQuery(url);
    const responseData2 = { id: 2, name: 'test2' };
    mock.onGet(url).reply(200, responseData2);
    fn();

    await vi.runAllTimersAsync();

    expect(query.data).toEqual(responseData2);
  });

  it('given a fn that rejects, when useQuery with immediate, then after run isError true, error set, pending/fetching false, data null', async () => {
    const error = new Error('Fetch failed');
    const fn = vi.fn().mockRejectedValue(error);
    const query = useQuery({ fn, immediate: true });

    expect(query.isError).toBe(false);
    expect(query.error).toBe(null);

    await vi.runAllTimersAsync();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(query.status).toBe('error');
    expect(query.fetchStatus).toBe('idle');
    expect(query.responseStatus).toBe(null);
    expect(query.isError).toBe(true);
    expect(query.error).toEqual(error);
    expect(query.isPending).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.data).toBe(null);
  });

  it('given a fn with multiple resolved values, when query.fetch is called after initial, then fn called again and data updated to second response, states inactive', async () => {
    const responseData1 = { id: 1 };
    const responseData2 = { id: 2 };
    const fn = vi.fn()
      .mockResolvedValueOnce({ data: responseData1 } as any)
      .mockResolvedValueOnce({ data: responseData2 } as any);
    const query = useQuery({ fn, immediate: true });

    await vi.runAllTimersAsync();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(query.data).toEqual(responseData1);

    await query.fetch();

    expect(fn).toHaveBeenCalledTimes(2);
    expect(query.data).toEqual(responseData2);
    expect(query.isFetching).toBe(false);
    expect(query.isPending).toBe(false);
  });

  it('given fn depending on reactive ref source, when the source value changes, then query automatically refetches with new params and data updates', async () => {
    const agent = createApiAgent();
    const mock = new MockAdapter(agent.agent);
    const responseData1 = [{ id: 1 }];
    const responseData2 = [{ id: 2 }];
    mock.onGet('/posts?_page=1&_limit=10').reply(200, responseData1);
    mock.onGet('/posts?_page=2&_limit=10').reply(200, responseData2);

    const page = ref(1);
    const fn = () => agent.get(`/posts?_page=${page.value}&_limit=10`);
    const query = useQuery({ fn, source: page });

    await vi.runAllTimersAsync();

    expect(query.data).toEqual(responseData1);
    expect(mock.history.get[0].url).toBe('/posts?_page=1&_limit=10');

    page.value = 2;
    await vi.runAllTimersAsync();


    expect(query.data).toEqual(responseData2);
    expect(mock.history.get[1].url).toBe('/posts?_page=2&_limit=10');
    expect(mock.history.get.length).toBe(2);
  });

  it('given fn depending on a computed source (object or primitive result), when the computed invalidates, then query refetches (leveraging computed as ref-like source)', async () => {
    const agent = createApiAgent();
    const mock = new MockAdapter(agent.agent);
    const responseData1 = [{ id: 1 }];
    const responseData2 = [{ id: 2 }];
    mock.onGet('/posts?_page=1&_limit=10').reply(200, responseData1);
    mock.onGet('/posts?_page=2&_limit=10').reply(200, responseData2);

    const page = ref(1);
    const pageDoubled = computed(() => page.value * 2); // computed as source (will be treated via isRef + .value)
    const fn = () => agent.get(`/posts?_page=${page.value}&_limit=10`);
    // pass computed directly as source (supported in types and effect machinery)
    const query = useQuery({ fn, source: pageDoubled });

    await vi.runAllTimersAsync();

    expect(query.data).toEqual(responseData1);

    page.value = 2; // invalidates the computed source
    await vi.runAllTimersAsync();

    expect(query.data).toEqual(responseData2);
  });

  it('given immediate as a reactive ref initially false, when it is set to true, then query fetches and populates data', async () => {
    const agent = createApiAgent();
    const mock = new MockAdapter(agent.agent);
    const responseData1 = [{ id: 1 }];
    mock.onGet('/posts?_page=1&_limit=10').reply(200, responseData1);

    const immediate = ref(false);
    const fn = () => agent.get(`/posts?_page=1&_limit=10`);
    const query = useQuery({ fn, immediate });

    expect(query.status).toBe('pending');
    expect(query.fetchStatus).toBe('idle');
    expect(query.isPending).toBe(true);
    expect(query.isLoading).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.isError).toBe(false);
    expect(query.data).toBe(null);
    expect(query.error).toBe(null);
    expect(query.isPlaceholderData).toBe(false);

    immediate.value = true;
    await vi.runAllTimersAsync();

    expect(query.status).toBe('success');
    expect(query.responseStatus).toBe(200);
    expect(query.data).toEqual(responseData1);
    expect(mock.history.get[0].url).toBe('/posts?_page=1&_limit=10');
  });

  it('given immediate false with reactive source, when fetch called manually then source changes and fetch again, then data updates on each manual fetch', async () => {
    const agent = createApiAgent();
    const mock = new MockAdapter(agent.agent);
    const responseData1 = [{ id: 1 }];
    const responseData2 = [{ id: 2 }];
    mock.onGet('/posts?_page=1&_limit=10').reply(200, responseData1);
    mock.onGet('/posts?_page=2&_limit=10').reply(200, responseData2);

    const page = ref(1);
    const fn = () => agent.get(`/posts?_page=${page.value}&_limit=10`);
    const query = useQuery({ fn, source: page, immediate: false });

    query.fetch();
    await vi.runAllTimersAsync();

    expect(query.data).toEqual(responseData1);
    expect(mock.history.get[0].url).toBe('/posts?_page=1&_limit=10');

    page.value = 2;
    query.fetch();
    await vi.runAllTimersAsync();

    expect(query.data).toEqual(responseData2);
    expect(mock.history.get[1].url).toBe('/posts?_page=2&_limit=10');
    expect(mock.history.get.length).toBe(2);
  });

  it('given initialData and immediate true, when fetch completes, then data becomes the real response and isPlaceholderData turns false', async () => {
    const initialData = { placeholder: true };
    const responseData = { id: 1 };
    const fn = vi.fn().mockResolvedValue({ data: responseData } as any);
    const query = useQuery({ fn, immediate: true, initialData });

    expect(query.data).toEqual(initialData);
    expect(query.isPlaceholderData).toBe(true);

    await vi.runAllTimersAsync();

    expect(query.data).toEqual(responseData);
    expect(query.isPlaceholderData).toBe(false);
  });

  it('given completed query, when fetch is called, then during the pending refetch isFetching is true while isPending stays false, then both false after', async () => {
    const fn = vi.fn().mockResolvedValue({ data: { id: 1 } } as any);
    const query = useQuery({ fn, immediate: true });

    await vi.runAllTimersAsync();

    expect(query.isPending).toBe(false);
    expect(query.isFetching).toBe(false);

    const refetchPromise = query.fetch();
    expect(query.isFetching).toBe(true);
    expect(query.isPending).toBe(false);

    await refetchPromise;
    expect(query.isFetching).toBe(false);
  });

  it('given a query, when fetch is called multiple times, then fn is called total of initial plus refetches, and final states are not pending or fetching', async () => {
    const fn = vi.fn().mockResolvedValue({ data: { id: 1 } } as any);
    const query = useQuery({ fn, immediate: true });

    await vi.runAllTimersAsync();

    await query.fetch();
    await query.fetch();

    expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 refetches
    expect(query.isPending).toBe(false);
    expect(query.isFetching).toBe(false);
  });

  // --- fetchOnExpired tests ---

  it('given fetchOnExpired as duration string on agent.get, when time advances past the duration after a successful fetch, then the query fn is automatically called again and data can update', async () => {
    const queryCache = createQueryCache();
    const agent = createApiAgent({ queryCache });
    const mock = new MockAdapter(agent.agent);
    const url = '/timer-refresh';
    const responseData1 = { id: 1 };
    const responseData2 = { id: 2 };

    mock.onGet(url).replyOnce(200, responseData1);
    mock.onGet(url).replyOnce(200, responseData2);

    const fn = () => agent.get(url, { expireIn: '1s', fetchOnExpired: '1s' });
    const query = useQuery({ fn, immediate: true });

    await vi.advanceTimersByTimeAsync(0);
    expect(mock.history.get.length).toBe(1);
    expect(query.data).toEqual(responseData1);

    vi.advanceTimersByTime(1001);
    await vi.advanceTimersByTimeAsync(0);

    expect(mock.history.get.length).toBe(2);
    expect(query.data).toEqual(responseData2);
    expect(query.isFetching).toBe(false);
    expect(query.isPending).toBe(false);
  });

  it('given fetchOnExpired as duration string matching agent expireIn + caching agent, when the scheduled refresh runs after expiration window, then a fresh request is made via the agent', async () => {
    const queryCache = createQueryCache();
    const agent = createApiAgent({ queryCache });
    const mock = new MockAdapter(agent.agent);
    const url = '/cached-refresh';
    const responseData1 = { version: 1 };
    const responseData2 = { version: 2 };

    mock.onGet(url).replyOnce(200, responseData1);
    mock.onGet(url).replyOnce(200, responseData2);

    const fn = () => agent.get(url, { expireIn: '2s', fetchOnExpired: '2s' });
    const query = useQuery({ fn, immediate: true });

    await vi.advanceTimersByTimeAsync(0);
    expect(query.data).toEqual(responseData1);
    expect(mock.history.get.length).toBe(1);
    expect(queryCache.has(url)).toBe(true);

    // Advance time past the expireIn window + scheduled fetchOnExpired
    vi.advanceTimersByTime(2100);
    await vi.advanceTimersByTimeAsync(0);

    // The scheduled re-call to fn should have caused the agent to see expired cache and issue a fresh network request
    expect(mock.history.get.length).toBe(2);
    expect(query.data).toEqual(responseData2);
  });

  it('given fetchOnExpired true (passive), when time advances, then no automatic extra call happens until explicit fetch', async () => {
    const responseData1 = { v: 1 };
    const responseData2 = { v: 2 };
    const fn = vi.fn()
      .mockResolvedValueOnce({ data: responseData1 } as any)
      .mockResolvedValueOnce({ data: responseData2 } as any);

    const query = useQuery({ fn, immediate: true });

    await vi.runAllTimersAsync();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(query.data).toEqual(responseData1);

    // Advancing a lot of time should not trigger auto re-call when using `true`
    vi.advanceTimersByTime(10000);
    await vi.runAllTimersAsync();
    expect(fn).toHaveBeenCalledTimes(1);

    // Explicit fetch still works and would pick up a fresh response (simulating "when cache expired" via manual trigger)
    await query.fetch();
    await vi.runAllTimersAsync();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(query.data).toEqual(responseData2);
  });

  it('given a reactive source, when source changes it refetches (fetchOnExpired option does not interfere with source reactivity)', async () => {
    const agent = createApiAgent();
    const mock = new MockAdapter(agent.agent);
    const responseData1 = [{ id: 1 }];
    const responseData2 = [{ id: 2 }];

    mock.onGet('/p?_page=1').reply(200, responseData1);
    mock.onGet('/p?_page=2').reply(200, responseData2);

    const page = ref(1);
    const fn = () => agent.get(`/p?_page=${page.value}`);

    const query = useQuery({ fn, source: page });

    await vi.advanceTimersByTimeAsync(0);
    expect(query.data).toEqual(responseData1);

    // change source → refetch (standard source reactivity test)
    page.value = 2;
    await vi.runAllTimersAsync();
    expect(query.data).toEqual(responseData2);
    expect(mock.history.get.length).toBe(2);
  });
});
