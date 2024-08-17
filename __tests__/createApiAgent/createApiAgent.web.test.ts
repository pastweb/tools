import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { createApiAgent } from '../../src/createApiAgent';

describe('createApiAgent', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
    jest.clearAllMocks();
  });

  it('should create an agent with default settings', async () => {
    const defaultHeaders = {
      common: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': undefined
      },
      delete: {},
      get: {},
      head: {},
      post: {},
      put: {},
      patch: {}
    };

    const agent = createApiAgent();

    expect(agent.agent.defaults.withCredentials).toBeUndefined();
    expect(JSON.stringify(agent.agent.defaults.headers)).toEqual(JSON.stringify(defaultHeaders));
  });

  it('should create an agent with custom headers', async () => {
    const headers = { 'X-Custom-Header': 'value' };
    const agent = createApiAgent({ headers });
    expect(JSON.stringify(agent.agentConfig.headers)).toEqual(JSON.stringify(headers));
  });

  it('should create an agent with credentials', async () => {
    const agent = createApiAgent({ withCredentials: true });
    expect(agent.agentConfig.withCredentials).toBe(true);
    expect(agent.uploadConfig.withCredentials).toBe(true);
    expect(agent.downloadConfig.withCredentials).toBe(true);
  });

  it('should set agent configuration', () => {
    const agent = createApiAgent();
    const config = { withCredentials: true };
    agent.setAgentConfig(config);
    expect(JSON.stringify(agent.agentConfig)).toEqual(JSON.stringify({ ...config, headers: {}}));
  });

  it('should merge agent configuration', () => {
    const agent = createApiAgent();
    const newSettings = { headers: { 'X-Custom-Header': 'value' } };
    agent.mergeAgentConfig(newSettings);
    expect((agent.agentConfig.headers as Record<string, string>)['X-Custom-Header']).toEqual(newSettings.headers['X-Custom-Header']);
  });

  it('should send a GET request', async () => {
    const agent = createApiAgent();
    const url = '/test';
    mock.onGet(url).reply(200, { data: 'test' });

    const response = await agent.get(url);
    expect(response.data).toEqual({ data: 'test' });
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
    global.URL.createObjectURL = jest.fn();
    const agent = createApiAgent();
    const url = '/download';
    const fileName = 'file.txt';
    const blob = new Blob(['file content'], { type: 'text/plain' });
    mock.onGet(url).reply(200, blob);
    URL.createObjectURL = jest.fn(() => 'blob:url');
    URL.revokeObjectURL = jest.fn();

    const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => document.createElement('div'));
    const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => document.createElement('div'));

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
    const onGetValidToken = jest.fn().mockResolvedValue(tokenHeader);
    const agent = createApiAgent({ onGetValidToken });
    const url = '/test';
    mock.onGet(url).reply(200, { data: 'test' });

    const response = await agent.get(url);
    expect(JSON.stringify(response.config.headers)).toEqual(JSON.stringify(tokenHeader));
  });

  it('should abort request if onGetValidToken returns null', async () => {
    const onGetValidToken = jest.fn().mockResolvedValue(null);
    const agent = createApiAgent({ onGetValidToken });
    const url = '/test';
    mock.onGet(url).reply(200, { data: 'test' });
    

    const response = await agent.get(url);
    expect(response.config.signal && response.config.signal instanceof AbortSignal).toBe(true);
  });
});
