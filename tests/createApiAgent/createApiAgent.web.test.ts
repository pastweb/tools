import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { createApiAgent } from '../../src/createApiAgent';

describe('createApiAgent', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    vi.useFakeTimers();
  });

  afterEach(() => {
    mock.reset();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should create an agent with default settings', async () => {
    const defaultHeaders = {
      common: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': undefined,
      },
      delete: {},
      get: {},
      head: {},
      post: {},
      put: {},
      patch: {},
      query: {},
    };

    const agent = createApiAgent();

    expect(agent.agent.defaults.withCredentials).toBeUndefined();
    expect(JSON.stringify(agent.agent.defaults.headers)).toEqual(JSON.stringify(defaultHeaders));
    expect(agent.cache.getAll()).toEqual([]);
  });

  it('should create an agent with custom headers and cache enabled', async () => {
    const headers = { 'X-Custom-Header': 'value' };
    const agent = createApiAgent({ headers, cache: true });
    expect(JSON.stringify(agent.agentConfig.headers)).toEqual(JSON.stringify(headers));
    expect(agent.cache.getAll()).toEqual([]);
  });

  it('should create an agent with credentials', async () => {
    const agent = createApiAgent({ withCredentials: true });
    expect(agent.agentConfig.withCredentials).toBe(true);
    expect(agent.uploadConfig.withCredentials).toBe(true);
    expect(agent.downloadConfig.withCredentials).toBe(true);
  });

  it('should set agent configuration', () => {
    const agent = createApiAgent();
    const config = { withCredentials: true, pagination: { defaultPageLimit: 50 } };
    agent.setAgentOptions(config);
    expect(agent.agentConfig.withCredentials).toBe(true);
  });

  it('should merge agent configuration', () => {
    const agent = createApiAgent();
    const newSettings = { headers: { 'X-Custom-Header': 'value' } };
    agent.mergeAgentConfig(newSettings);
    expect((agent.agentConfig.headers as Record<string, string>)['X-Custom-Header']).toEqual(newSettings.headers['X-Custom-Header']);
  });

  it('should send a GET request with caching', async () => {
    const agent = createApiAgent({ cache: true });
    const url = '/test';
    const responseData = { data: 'test' };
    mock.onGet(url).reply(200, responseData);

    const response1 = await agent.get(url, { queryKey: 'test-key' });
    expect(response1.data).toEqual(responseData);
    expect(agent.cache.has('test-key')).toBe(true);

    mock.onGet(url).reply(500); // Simulate failure
    const response2 = await agent.get(url, { queryKey: 'test-key' });
    expect(response2.data).toEqual(responseData); // Should return cached response
  });

  it('should respect expireIn for cached GET requests', async () => {
    const agent = createApiAgent({ cache: true });
    const url = '/test';
    const responseData = { data: 'test' };
    mock.onGet(url).reply(200, responseData);

    // First request: cache the response
    const response1 = await agent.get(url, { queryKey: 'test-key', expireIn: '1s' });
    expect(response1.data).toEqual(responseData);
    expect(agent.cache.has('test-key')).toBe(true);
    expect(mock.history.get.length).toBe(1);

    // Modify the cache entry to simulate an older timestamp (2 seconds ago)
    const cacheEntry = agent.cache.get('test-key');
    if (cacheEntry) {
      agent.cache.set('test-key', {
        ...cacheEntry,
        timestamp: Date.now() - 2000, // Set timestamp to 2 seconds ago
      });
    }

    // Advance timers by 2 seconds to ensure cache is checked after expiration
    vi.advanceTimersByTime(2000);

    // Second request: should make a new request because cache is stale
    const response2 = await agent.get(url, { queryKey: 'test-key' });
    expect(agent.cache.has('test-key')).toBe(true); // Cache is updated with new response
    expect(mock.history.get.length).toBe(2); // New request was made
    expect(response2.data).toEqual(responseData);
  });

  it('should invalidate cache with single query key', async () => {
    const agent = createApiAgent({ cache: true });
    const url = '/test';
    const responseData = { data: 'test' };
    mock.onGet(url).reply(200, responseData);

    await agent.get(url, { queryKey: 'test-key' });
    expect(agent.cache.has('test-key')).toBe(true);

    agent.cache.invalidateQuery('test-key');
    const data = agent.cache.get('test-key');
    expect(data?.invalid).toBe(true);
  });

  it('should invalidate cache with array of query keys as prefixes', async () => {
    const agent = createApiAgent({ cache: true });
    const url1 = '/api/users/1';
    const url2 = '/api/posts/1';
    const responseData = { data: 'test' };
    mock.onGet(url1).reply(200, responseData);
    mock.onGet(url2).reply(200, responseData);

    await agent.get(url1, { queryKey: 'users-1' });
    await agent.get(url2, { queryKey: 'posts-1' });
    expect(agent.cache.has('users-1')).toBe(true);
    expect(agent.cache.has('posts-1')).toBe(true);

    agent.cache.invalidateQuery(['users', 'posts']);
    const data1 = agent.cache.get('users-1');
    const data2 = agent.cache.get('posts-1');
    expect(data1?.invalid).toBe(true);
    expect(data2?.invalid).toBe(true);
  });

  it('should handle pagination in GET response', async () => {
    const agent = createApiAgent({
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      pagination: {
        defaultPageLimit: 10,
        header: 'Content-Range',
      },
    });

    const url = '/test?limit=10';
    const responseData = [{ id: 1 }, { id: 2 }];
    mock.onGet(url).reply(200, responseData, { 'Content-Type': 'application/json', 'Content-Range': '0-1/20' });

    const response = await agent.get(url);
    expect(response.data).toEqual(responseData);
    expect(response.pagination).toEqual({ current: 1, of: 2, start: 0, end: 1, total: 20, size: 10 });
  });

  it('should send a POST request with mutation options', async () => {
    const agent = createApiAgent();
    const url = '/test';
    const data = { key: 'value' };
    const onSuccess = vi.fn();
    const onError = vi.fn();
    mock.onPost(url).reply(200, { data: 'test' });

    const response = await agent.post(url, data, { onSuccess, onError });
    expect(response.data).toEqual({ data: 'test' });
    expect(onSuccess).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('should handle POST request error with mutation options', async () => {
    const agent = createApiAgent();
    const url = '/test';
    const data = { key: 'value' };
    const onSuccess = vi.fn();
    const onError = vi.fn();
    mock.onPost(url).reply(500);

    await expect(agent.post(url, data, { onSuccess, onError })).rejects.toThrow();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });

  it('should send a GET request without credentials if excluded', async () => {
    const url = '/test';
    const agent = createApiAgent({ withCredentials: true, exclude: [url] });
    mock.onGet(url).reply(200, { data: 'test' });

    const response = await agent.get(url);
    expect(response.data).toEqual({ data: 'test' });
  });

  it('should attach token header if onGetValidToken is provided', async () => {
    const tokenHeader = { Authorization: 'Bearer token' };
    const onGetValidToken = vi.fn().mockResolvedValue(tokenHeader);
    const agent = createApiAgent({ onGetValidToken });
    const url = '/test';
    mock.onGet(url).reply(200, { data: 'test' });

    const response = await agent.get(url);
    expect(JSON.stringify(response.config.headers)).toEqual(JSON.stringify(tokenHeader));
  });

  it('should handle unauthorized response', async () => {
    const onUnauthorizedResponse = vi.fn();
    const agent = createApiAgent({ onUnauthorizedResponse });
    const url = '/test';
    mock.onGet(url).reply(401);

    await expect(agent.get(url)).rejects.toThrow();
    expect(onUnauthorizedResponse).toHaveBeenCalled();
  });

  it('should calculate pagination offset correctly', () => {
    const agent = createApiAgent({ pagination: { defaultPageLimit: 10 } });
    expect(agent.pageToOffset(2, 10)).toBe(10);
    expect(agent.pageToOffset(1, 5)).toBe(0);
  });

  it('should send a POST request', async () => {
    const agent = createApiAgent();
    const url = '/test';
    const data = { key: 'value' };
    mock.onPost(url).reply(200, { data: 'test' });

    const response = await agent.post(url, data);
    expect(response.data).toEqual({ data: 'test' });
  });

  it('should handle file upload', async () => {
    const agent = createApiAgent();
    const url = '/upload';
    const data = new FormData();
    mock.onPost(url).reply(200, { data: 'uploaded' });

    const response = await agent.upload(url, data);
    expect(response.data).toEqual({ data: 'uploaded' });
  });

  it('should handle file download', async () => {
    const agent = createApiAgent();
    const url = '/download';
    const fileName = 'file.txt';
    const blob = new Blob(['file content'], { type: 'text/plain' });
    mock.onGet(url).reply(200, blob);
    URL.createObjectURL = vi.fn(() => 'blob:url');
    URL.revokeObjectURL = vi.fn();

    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.createElement('div'));
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.createElement('div'));

    const response = await agent.download(url, fileName);

    expect(response.data).toEqual(blob);
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();

    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('should send a GET request without ast credentials', async () => {
    const url = '/test';
    const agent = createApiAgent({ withCredentials: true, exclude: [ url ] });
    mock.onGet(url).reply(200, { data: 'test' });

    const response = await agent.get(url);
    expect(response.data).toEqual({ data: 'test' });
  });

  it('should attach token header if onGetValidToken is provided', async () => {
    const tokenHeader = { Authorization: 'Bearer token' };
    const onGetValidToken = vi.fn().mockResolvedValue(tokenHeader);
    const agent = createApiAgent({ onGetValidToken });
    const url = '/test';
    mock.onGet(url).reply(200, { data: 'test' });

    const response = await agent.get(url);
    expect(JSON.stringify(response.config.headers)).toEqual(JSON.stringify(tokenHeader));
  });

  it('should abort request if onGetValidToken returns null', async () => {
    const onGetValidToken = vi.fn().mockResolvedValue(null);
    const agent = createApiAgent({ onGetValidToken });
    const url = '/test';
    mock.onGet(url).reply(200, { data: 'test' });
    

    const response = await agent.get(url);
    expect(response.config.signal && response.config.signal instanceof AbortSignal).toBe(true);
  });
});
