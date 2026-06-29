import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { createApiAgent } from '../../src/api';

describe('given createApiAgent toon support', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('given toon true and no Accept header, when get is called, then it sends Accept text/toon', async () => {
    const agent = createApiAgent();
    const url = '/toon';

    mock.onGet(url).reply(200, 'name: Ada', { 'Content-Type': 'text/toon' });

    await agent.get(url, { toon: true });

    expect(mock.history.get[0].headers).toMatchObject({ Accept: 'text/toon' });
  });

  it('given toon true and an existing Accept header, when get is called, then it appends text/toon', async () => {
    const agent = createApiAgent();
    const url = '/toon-accept';

    mock.onGet(url).reply(200, 'name: Ada', { 'Content-Type': 'text/toon; charset=utf-8' });

    await agent.get(url, { toon: true, headers: { Accept: 'application/json' } });

    expect(mock.history.get[0].headers).toMatchObject({ Accept: 'application/json, text/toon' });
  });

  it('given a text/toon response, when get resolves, then response data is decoded into a javascript object', async () => {
    const agent = createApiAgent();
    const url = '/toon-data';

    mock.onGet(url).reply(200, 'name: Ada\nage: 37', { 'Content-Type': 'text/toon; charset=utf-8' });

    const response = await agent.get(url, { toon: true });

    expect(response.data).toEqual({ name: 'Ada', age: 37 });
  });
});
