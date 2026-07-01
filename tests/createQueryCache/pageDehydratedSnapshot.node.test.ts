import { describe, expect, it } from 'vitest';
import { createQueryCache } from '../../src/api/createQueryCache';

describe('given page dehydrated snapshot helpers on node', () => {
  it('when no document exists, then createQueryCache does not try to hydrate a page snapshot', () => {
    const queryCache = createQueryCache();

    expect(queryCache.getAll()).toEqual([]);
  });
});
