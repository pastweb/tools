import { beforeEach, describe, expect, it } from 'vitest';
import {
  createQueryCache,
  DEHYDRATED_SCRIPT_ID,
} from '../../src/api/createQueryCache';

describe('given page dehydrated snapshot helpers in the browser', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('when no custom id is configured, then uses the default dehydrated script id', () => {
    expect(DEHYDRATED_SCRIPT_ID).toBe('__API_DEHYDRATED__');
    expect(createQueryCache().getDehydrateScriptID()).toBe(DEHYDRATED_SCRIPT_ID);
  });

  it('when a dehydrated snapshot script exists, then createQueryCache hydrates it automatically', () => {
    const snapshot = JSON.stringify({
      '["users"]': [
        '/api/users',
        {},
        false,
        {
          data: [{ id: 1, name: 'Ada' }],
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        },
        Date.now(),
        '',
        '',
        '',
        false,
        false,
      ],
    });

    document.body.innerHTML = `<script id="${DEHYDRATED_SCRIPT_ID}" type="application/json">${snapshot}</script>`;

    const queryCache = createQueryCache();

    expect(queryCache.get('["users"]')?.response.data).toEqual([{ id: 1, name: 'Ada' }]);
  });

  it('when a custom dehydrated script id exists, then createQueryCache hydrates from that id', () => {
    const scriptID = '__CUSTOM_API_STATE__';
    const snapshot = JSON.stringify({
      '/api/posts': [
        '/api/posts',
        {},
        false,
        {
          data: [{ id: 1, title: 'Hello' }],
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        },
        Date.now(),
        '',
        '',
        '',
        false,
        false,
      ],
    });

    document.body.innerHTML = `<script id="${scriptID}" type="application/json">${snapshot}</script>`;

    const queryCache = createQueryCache({ deHydratedScriptID: scriptID });

    expect(queryCache.getDehydrateScriptID()).toBe(scriptID);
    expect(queryCache.get('/api/posts')?.response.data).toEqual([{ id: 1, title: 'Hello' }]);
  });

  it('when a manual snapshot is provided, then queryCache.hydrate can hydrate it directly', () => {
    const queryCache = createQueryCache();
    const snapshot = JSON.stringify({
      '/api/manual': [
        '/api/manual',
        {},
        false,
        {
          data: { ok: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        },
        Date.now(),
        '',
        '',
        '',
        false,
        false,
      ],
    });

    queryCache.hydrate(snapshot);

    expect(queryCache.get('/api/manual')?.response.data).toEqual({ ok: true });
  });
});
