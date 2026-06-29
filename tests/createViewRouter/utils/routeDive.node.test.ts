import { describe, it, expect, beforeEach, vi } from 'vitest';
import { routeDive, SelectedRoute } from '../../src/createViewRouter';

describe('routeDive', () => {
  let mockRoute: SelectedRoute;

  beforeEach(() => {
    mockRoute = {
      path: '/',
      regex: /.*/,
      params: {},
      searchParams: new URLSearchParams(),
      setSearchParams: vi.fn(),
      hash: '',
      setHash: vi.fn(),
      views: {},
      options: {},
      child: {
        path: '/child',
        regex: /.*/,
        params: {},
        searchParams: new URLSearchParams(),
        setSearchParams: vi.fn(),
        hash: '',
        setHash: vi.fn(),
        views: {},
        options: {},
        child: {
          path: '/child/grandchild',
          regex: /.*/,
          params: {},
          searchParams: new URLSearchParams(),
          setSearchParams: vi.fn(),
          hash: '',
          setHash: vi.fn(),
          views: {},
          options: {},
          child: null,
        }
      }
    } as unknown as SelectedRoute;
  });

  it('given a route tree and depth 0, when routeDive is called, then it returns the top level route itself', () => {
    const result = routeDive(mockRoute, 0);
    expect(result.path).toBe(mockRoute.path);
  });

  it('given depth 1, when routeDive descends, then it returns the direct child under the current route', () => {
    const result = routeDive(mockRoute, 1);
    expect(result.path).toEqual((mockRoute.child as SelectedRoute).path);
  });

  it('given depth 2, when routeDive is used, then it returns the grandchild following the path of children', () => {
    const result = routeDive(mockRoute, 2);
    expect(result).toEqual((mockRoute.child as SelectedRoute).child);
  });

  it('given a depth deeper than the tree, when routeDive runs, then it returns the deepest existing route without error', () => {
    const result = routeDive(mockRoute, 3);
    expect(result).toEqual((mockRoute.child as SelectedRoute).child);
  });

  it('given a leaf route (no children), when routeDive is asked for positive depth, then it still returns the leaf route', () => {
    const singleLevelRoute: SelectedRoute = {
      path: '/single',
      regexp: /.*/,
      params: {},
      searchParams: new URLSearchParams(),
      setSearchParams: vi.fn(),
      hash: '',
      setHash: vi.fn(),
      views: {},
      options: {},
      child: false,
      parent: false
    };
    const result = routeDive(singleLevelRoute, 1);
    expect(result).toEqual(singleLevelRoute);
  });
});
