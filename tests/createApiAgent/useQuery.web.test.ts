import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { createApiAgent, useQuery } from '../../src/createApiAgent';
import { ref } from '../../src/reactivity';
import { QueryData } from '../../src/createApiAgent/types';

describe('useQuery', () => {
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

  it('should initialize with correct default state', () => {
    const fn = vi.fn().mockResolvedValue({ data: { id: 1 } } as any);
    const query = useQuery({ fn });

    expect(query.isPending).toBe(true);
    expect(query.isLoading).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.isError).toBe(false);
    expect(query.data).toBe(null);
    expect(query.error).toBe(null);
    expect(query.isPlaceholderData).toBe(false);
  });

  it('should initialize with initialData and isPlaceholderData true', () => {
    const initialData = { id: 0 };
    const fn = vi.fn().mockResolvedValue({ data: { id: 1 } } as any);
    const query = useQuery({ fn, initialData });

    expect(query.data).toEqual(initialData);
    expect(query.isPlaceholderData).toBe(true);
    expect(query.isPending).toBe(true);
    expect(query.isFetching).toBe(true);
  });

  it('should not run fetch if immediate is false', async () => {
    const fn = vi.fn().mockResolvedValue({ data: { id: 1 } } as any);
    const query = useQuery({ fn, immediate: false });

    expect(query.isPending).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should fetch data when immediate is true and update state', async () => {
    const agent = createApiAgent({ cache: true });
    const url = '/test';
    const responseData = { id: 1, name: 'test' };
    mock.onGet(url).reply(200, responseData);
    
    const fn = () => agent.get(url, { queryKey: 'test-key' });
    const query = useQuery({ fn, immediate: true });

    expect(query.isPending).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.data).toBe(null);

    await vi.runAllTimersAsync();

    expect(agent.cache.has('test-key')).toBe(true);
    expect(query.isPending).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.data).toEqual(responseData);
    expect(query.isError).toBe(false);
    expect(query.error).toBe(null);
  });

  it('should update the state if fn is called again independently', async () => {
    const agent = createApiAgent({ cache: true });
    const url = '/test';
    const responseData = { id: 1, name: 'test' };
    mock.onGet(url).reply(200, responseData);
    
    const fn = () => agent.get(url, { queryKey: 'test-key' });
    const query = useQuery({ fn, immediate: true });

    expect(query.isPending).toBe(true);
    expect(query.isFetching).toBe(true);
    expect(query.data).toBe(null);

    await vi.runAllTimersAsync();

    const data = agent.cache.get('test-key') as QueryData;
    expect(data.onDataCallbacks.size).toBe(1);
    expect(agent.cache.has('test-key')).toBe(true);
    expect(query.isPending).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.data).toEqual(responseData);
    expect(query.isError).toBe(false);
    expect(query.error).toBe(null);

    agent.cache.invalidateQuery('test-key');
    const responseData2 = { id: 2, name: 'test2' };
    mock.onGet(url).reply(200, responseData2);
    fn();

    await vi.runAllTimersAsync();

    expect(query.data).toEqual(responseData2);
  });

  it('should handle fetch error and update error state', async () => {
    const error = new Error('Fetch failed');
    const fn = vi.fn().mockRejectedValue(error);
    const query = useQuery({ fn, immediate: true });

    expect(query.isError).toBe(false);
    expect(query.error).toBe(null);

    await vi.runAllTimersAsync();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(query.isError).toBe(true);
    expect(query.error).toEqual(error);
    expect(query.isPending).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.data).toBe(null);
  });

  it('should refetch when fetch method is called', async () => {
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

  it('should refetch when reactive dependencies in fn change', async () => {
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

  it('should fetch when immediate become true', async () => {
    const agent = createApiAgent();
    const mock = new MockAdapter(agent.agent);
    const responseData1 = [{ id: 1 }];
    mock.onGet('/posts?_page=1&_limit=10').reply(200, responseData1);

    const immediate = ref(false);
    const fn = () => agent.get(`/posts?_page=1&_limit=10`);
    const query = useQuery({ fn, immediate });

    expect(query.isPending).toBe(false);
    expect(query.isLoading).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.isError).toBe(false);
    expect(query.data).toBe(null);
    expect(query.error).toBe(null);
    expect(query.isPlaceholderData).toBe(false);

    immediate.value = true;
    await vi.runAllTimersAsync();

    expect(query.data).toEqual(responseData1);
    expect(mock.history.get[0].url).toBe('/posts?_page=1&_limit=10');
  });

  it('should fetch correctly when immediate is false', async () => {
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

  it('should handle initialData and update isPlaceholderData after fetch', async () => {
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

  it('should set isFetching true during refetch but keep isPending false', async () => {
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

  it('should handle multiple refetches correctly', async () => {
    const fn = vi.fn().mockResolvedValue({ data: { id: 1 } } as any);
    const query = useQuery({ fn, immediate: true });

    await vi.runAllTimersAsync();

    await query.fetch();
    await query.fetch();

    expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 refetches
    expect(query.isPending).toBe(false);
    expect(query.isFetching).toBe(false);
  });
});
