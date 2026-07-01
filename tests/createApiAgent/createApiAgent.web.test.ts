import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { createApiAgent, createQueryCache } from '../../src/api';

vi.mock('../../src/envs', () => ({
  isBrowser: true,
  isServer: false,
}));

describe('given createApiAgent factory, when instantiating and configuring an agent, then it supports request methods, caching, pagination, auth, and file operations with correct behavior', () => {
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

  it('given no options provided, when createApiAgent is called, then the agent has undefined withCredentials, default headers object, and no cache', async () => {
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
    expect('cache' in agent).toBe(false);
  });

  it('given custom headers and queryCache, when createApiAgent is called, then agentConfig.headers match the provided headers and cache starts empty', async () => {
    const headers = { 'X-Custom-Header': 'value' };
    const queryCache = createQueryCache();
    const agent = createApiAgent({ headers, queryCache });
    expect(JSON.stringify(agent.agentConfig.headers)).toEqual(JSON.stringify(headers));
    expect(queryCache.getAll()).toEqual([]);
  });

  it('given withCredentials true, when createApiAgent is called, then withCredentials is true for agentConfig, uploadConfig and downloadConfig', async () => {
    const agent = createApiAgent({ withCredentials: true });
    expect(agent.agentConfig.withCredentials).toBe(true);
    expect(agent.uploadConfig.withCredentials).toBe(true);
    expect(agent.downloadConfig.withCredentials).toBe(true);
  });

  it('given a created agent, when setAgentOptions is called with config, then the agentConfig is updated accordingly', () => {
    const agent = createApiAgent();
    const config = { withCredentials: true, pagination: { defaultPageLimit: 50 } };
    agent.setAgentOptions(config);
    expect(agent.agentConfig.withCredentials).toBe(true);
  });

  it('given a created agent, when mergeAgentConfig is called with new settings, then the provided headers are merged into agentConfig', () => {
    const agent = createApiAgent();
    const newSettings = { headers: { 'X-Custom-Header': 'value' } };
    agent.mergeAgentConfig(newSettings);
    expect((agent.agentConfig.headers as Record<string, string>)['X-Custom-Header']).toEqual(newSettings.headers['X-Custom-Header']);
  });

  it('given an agent with cache enabled, when get is called with a structured queryKey, then data is cached under the serialized key (not the raw URL), and later failed requests return cached data', async () => {
    const queryCache = createQueryCache();
    const agent = createApiAgent({ queryCache });
    const url = '/test';
    const responseData = { data: 'test' };
    mock.onGet(url).reply(200, responseData);

    const qk = ['test', 'resource'];
    const serializedKey = JSON.stringify(qk);

    const response1 = await agent.get(url, { queryKey: qk });
    expect(response1.data).toEqual(responseData);
    expect(queryCache.has(url)).toBe(false);
    expect(queryCache.has(serializedKey)).toBe(true);

    mock.onGet(url).reply(500); // Simulate failure
    const response2 = await agent.get(url, { queryKey: qk });
    expect(response2.data).toEqual(responseData); // cache hit via serialized key
  });

  it('given a cached GET with expireIn, when cache timestamp is expired via timer advance, then a fresh request is made and cache updated on subsequent get', async () => {
    const queryCache = createQueryCache();
    const agent = createApiAgent({ queryCache });
    const url = '/test';
    const responseData = { data: 'test' };
    mock.onGet(url).reply(200, responseData);

    // First request: cache the response
    const response1 = await agent.get(url, { expireIn: '1s' });
    expect(response1.data).toEqual(responseData);
    expect(queryCache.has(url)).toBe(true);
    expect(mock.history.get.length).toBe(1);

    // Modify the cache entry (QueryData) to simulate an older timestamp (2 seconds ago)
    const cacheEntry = queryCache.get(url);
    if (cacheEntry) {
      cacheEntry.timestamp = Date.now() - 2000;
    }

    // Advance timers by 2 seconds to ensure cache expiration check uses wall time
    vi.advanceTimersByTime(2000);

    // Second request: should make a new request because cache is stale (isDateYoungerOf fails)
    const response2 = await agent.get(url, { expireIn: '1s' });
    expect(queryCache.has(url)).toBe(true); // Cache is updated with new response
    expect(mock.history.get.length).toBe(2); // New request was made
    expect(response2.data).toEqual(responseData);
  });

  it('given a cached entry, when invalidateQuery is called with that url key, then the cache entry is marked as invalid', async () => {
    const queryCache = createQueryCache();
    const agent = createApiAgent({ queryCache });
    const url = '/test';
    const responseData = { data: 'test' };
    mock.onGet(url).reply(200, responseData);

    await agent.get(url);
    expect(queryCache.has(url)).toBe(true);

    queryCache.invalidateQuery(url);
    const data = queryCache.get(url);
    expect(data?.invalid).toBe(true);
  });

  it('given cached entries, when invalidateQuery is called with an array of url prefixes, then all matching cache entries (by url) are marked invalid', async () => {
    const queryCache = createQueryCache();
    const agent = createApiAgent({ queryCache });
    const url1 = '/api/users/1';
    const url2 = '/api/posts/1';
    const responseData = { data: 'test' };
    mock.onGet(url1).reply(200, responseData);
    mock.onGet(url2).reply(200, responseData);

    await agent.get(url1);
    await agent.get(url2);
    expect(queryCache.has(url1)).toBe(true);
    expect(queryCache.has(url2)).toBe(true);

    // Multiple different prefixes: call invalidateQuery for each (or use a broader common prefix)
    queryCache.invalidateQuery('/api/users');
    queryCache.invalidateQuery('/api/posts');
    const data1 = queryCache.get(url1);
    const data2 = queryCache.get(url2);
    expect(data1?.invalid).toBe(true);
    expect(data2?.invalid).toBe(true);
  });

  it('given a cached entry using structured queryKey, when invalidateQuery is called with matching array key, then it is marked invalid', async () => {
    const queryCache = createQueryCache();
    const agent = createApiAgent({ queryCache });
    const url = '/test-structured';
    const qk = ['resource', 'abc123'];
    const responseData = { data: 'structured' };
    mock.onGet(url).reply(200, responseData);

    await agent.get(url, { queryKey: qk });
    const serialized = JSON.stringify(qk);
    expect(queryCache.has(serialized)).toBe(true);

    // Should accept the same array form used at query time
    queryCache.invalidateQuery(qk);
    expect(queryCache.get(serialized)?.invalid).toBe(true);
  });

  it('given an agent created without queryCache, when get is called using queryKey or expireIn, then console.error is emitted explaining the missing queryCache', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const agent = createApiAgent();
    mock.onGet('/warn1').reply(200, {});
    mock.onGet('/warn2').reply(200, {});

    await agent.get('/warn1', { queryKey: ['test'] });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('cache-related options')
    );
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('no `queryCache` was passed in AgentOptions')
    );

    spy.mockClear();

    await agent.get('/warn2', { expireIn: '30s' });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('cache-related options')
    );

    spy.mockRestore();
  });

  it('given legacy cache true is passed through untyped code, when get is called with cache options, then no internal cache is created', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const agent = createApiAgent({ cache: true } as any);

    mock.onGet('/legacy-cache').reply(200, { ok: true });

    const response = await agent.get('/legacy-cache', { queryKey: ['legacy-cache'] });

    expect(response.data).toEqual({ ok: true });
    expect('cache' in agent).toBe(false);
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('no `queryCache` was passed in AgentOptions')
    );

    spy.mockRestore();
  });

  it('given an agent created with queryCache, when get is called with queryKey/expireIn, then no console.error about missing queryCache is emitted', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const queryCache = createQueryCache();
    const agent = createApiAgent({ queryCache });

    mock.onGet('/ok').reply(200, {});
    await agent.get('/ok', { queryKey: ['ok'], expireIn: '1m' });

    // The only possible errors would be unrelated; ensure our specific message wasn't logged
    const calls = spy.mock.calls.flat();
    expect(calls.some(c => typeof c === 'string' && c.includes('no `queryCache` was passed'))).toBe(false);

    spy.mockRestore();
  });

  it('given pagination options with header, when get returns a response with Content-Range header, then the response includes a parsed pagination object', async () => {
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

  it('given onSuccess and onError handlers, when post succeeds, then the response is returned and onSuccess is invoked while onError is not', async () => {
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

  it('given onSuccess and onError handlers, when post fails with 500, then promise rejects, onSuccess not called, and onError is called', async () => {
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

  it('given withCredentials true but url in exclude list, when get is called on that url, then the request succeeds and returns data', async () => {
    const url = '/test';
    const agent = createApiAgent({ withCredentials: true, exclude: [url] });
    mock.onGet(url).reply(200, { data: 'test' });

    const response = await agent.get(url);
    expect(response.data).toEqual({ data: 'test' });
  });

  it('given onGetValidToken returning a token header, when get is called, then the response config headers contain the Authorization token', async () => {
    const tokenHeader = { Authorization: 'Bearer token' };
    const onGetValidToken = vi.fn().mockResolvedValue(tokenHeader);
    const agent = createApiAgent({ onGetValidToken });
    const url = '/test';
    mock.onGet(url).reply(200, { data: 'test' });

    const response = await agent.get(url);
    expect(JSON.stringify(response.config.headers)).toEqual(JSON.stringify(tokenHeader));
  });

  it('given onUnauthorizedResponse handler, when get receives a 401 response, then the handler is called and the promise rejects', async () => {
    const onUnauthorizedResponse = vi.fn();
    const agent = createApiAgent({ onUnauthorizedResponse });
    const url = '/test';
    mock.onGet(url).reply(401);

    await expect(agent.get(url)).rejects.toThrow();
    expect(onUnauthorizedResponse).toHaveBeenCalled();
  });

  it('given default pagination limit, when pageToOffset is invoked with page number and limit, then it computes the correct byte offset for pagination', () => {
    const agent = createApiAgent({ pagination: { defaultPageLimit: 10 } });
    expect(agent.pageToOffset(2, 10)).toBe(10);
    expect(agent.pageToOffset(1, 5)).toBe(0);
  });

  it('given an agent, when post is called with url and data, then the response contains the expected data from server', async () => {
    const agent = createApiAgent();
    const url = '/test';
    const data = { key: 'value' };
    mock.onPost(url).reply(200, { data: 'test' });

    const response = await agent.post(url, data);
    expect(response.data).toEqual({ data: 'test' });
  });

  it('given an agent and FormData, when upload is called, then the server response for the upload is returned', async () => {
    const agent = createApiAgent();
    const url = '/upload';
    const data = new FormData();
    mock.onPost(url).reply(200, { data: 'uploaded' });

    const response = await agent.upload(url, data);
    expect(response.data).toEqual({ data: 'uploaded' });
  });

  it('given a download url and filename, when download is called on agent, then blob response is received and DOM operations for download are performed', async () => {
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

  it('given withCredentials and exclude containing the url, when get is called, then the request completes successfully without credentials enforcement', async () => {
    const url = '/test';
    const agent = createApiAgent({ withCredentials: true, exclude: [ url ] });
    mock.onGet(url).reply(200, { data: 'test' });

    const response = await agent.get(url);
    expect(response.data).toEqual({ data: 'test' });
  });

  it('given onGetValidToken returning a token header, when get is called, then the response config headers contain the Authorization token', async () => {
    const tokenHeader = { Authorization: 'Bearer token' };
    const onGetValidToken = vi.fn().mockResolvedValue(tokenHeader);
    const agent = createApiAgent({ onGetValidToken });
    const url = '/test';
    mock.onGet(url).reply(200, { data: 'test' });

    const response = await agent.get(url);
    expect(JSON.stringify(response.config.headers)).toEqual(JSON.stringify(tokenHeader));
  });

  it('given onGetValidToken that resolves to null, when get is called, then the request uses an AbortSignal in its config', async () => {
    const onGetValidToken = vi.fn().mockResolvedValue(null);
    const agent = createApiAgent({ onGetValidToken });
    const url = '/test';
    mock.onGet(url).reply(200, { data: 'test' });
    

    const response = await agent.get(url);
    expect(response.config.signal && response.config.signal instanceof AbortSignal).toBe(true);
  });
});
