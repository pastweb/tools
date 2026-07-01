import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { createApiAgent, createQueryCache } from '../../src/api';

vi.mock('../../src/envs', () => ({
  isServer: false,
  isBrowser: true,
}));

describe('given the agent.get select option', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it('given a GET with select and no queryCache, when the request resolves, then response.data is projected', async () => {
    const agent = createApiAgent();
    const url = '/select-plain';
    mock.onGet(url).reply(200, { items: [{ id: 1 }], total: 1 });

    const response = await agent.get(url, {
      select: data => data.items,
    });

    expect(response.data).toEqual([{ id: 1 }]);
  });

  it('given a cached GET with select, when cache is written and read again, then returned data is projected but cache stores the raw response', async () => {
    const queryCache = createQueryCache();
    const agent = createApiAgent({ queryCache });
    const url = '/select-cached';
    const queryKey = ['select', 'cached'];
    mock.onGet(url).reply(200, { items: [{ id: 2 }], total: 1 });

    const response1 = await agent.get(url, {
      queryKey,
      select: data => data.items,
    });
    const response2 = await agent.get(url, {
      queryKey,
      select: data => data.total,
    });

    expect(response1.data).toEqual([{ id: 2 }]);
    expect(response2.data).toBe(1);
    expect(queryCache.get(JSON.stringify(queryKey))?.response.data).toEqual({ items: [{ id: 2 }], total: 1 });
    expect(mock.history.get.length).toBe(1);
  });
});
