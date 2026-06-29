import { describe, it, expect, afterEach } from 'vitest';
import {
  clearSSRDehydratedState,
  getSSRDehydratedState,
  setSSRDehydratedState,
} from '../../src/api/createQueryCache';

describe('given query-cache SSR dehydrated state helpers', () => {
  afterEach(() => {
    clearSSRDehydratedState();
  });

  it('when a snapshot is set, then it can be read and cleared', () => {
    setSSRDehydratedState('{"users":[]}');

    expect(getSSRDehydratedState()).toBe('{"users":[]}');

    clearSSRDehydratedState();

    expect(getSSRDehydratedState()).toBeNull();
  });

  it('when null is set, then the current snapshot is cleared', () => {
    setSSRDehydratedState('{"users":[]}');
    setSSRDehydratedState(null);

    expect(getSSRDehydratedState()).toBeNull();
  });
});
