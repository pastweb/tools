import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createQueryCache, sliceDehydratedState } from '../../src/api/createQueryCache';
import type { AxiosInstance } from 'axios';

describe('given sliceDehydratedState', () => {
  let mockAgent: AxiosInstance;

  beforeEach(() => {
    mockAgent = {
      get: vi.fn().mockImplementation((url: string) =>
        Promise.resolve({
          data: { url },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        })
      ),
    } as any;
  });

  it('when snapshot has matching queryKeys, then returns only those entries', async () => {
    const cache = createQueryCache();
    await cache.set('/users', mockAgent, { queryKey: ['users'] });
    await cache.set('/posts', mockAgent, { queryKey: ['posts'] });

    const full = await cache.dehydrate();
    const slice = sliceDehydratedState(full, [['users']]);
    const parsed = JSON.parse(slice);

    expect(Object.keys(parsed)).toEqual(['["users"]']);
    expect(parsed['["users"]']).toBeTruthy();
  });

  it('when no keys match, then returns empty object', async () => {
    const cache = createQueryCache();
    await cache.set('/users', mockAgent, { queryKey: ['users'] });
    const full = await cache.dehydrate();

    expect(sliceDehydratedState(full, [['missing']])).toBe('{}');
  });

  it('when snapshot is invalid, then returns empty object', () => {
    expect(sliceDehydratedState('not-json', [['a']])).toBe('{}');
    expect(sliceDehydratedState('', [['a']])).toBe('{}');
  });
});