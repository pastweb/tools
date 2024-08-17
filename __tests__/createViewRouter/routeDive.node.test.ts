import { routeDive, SelectedRoute } from '../../src/createViewRouter';

describe('routeDive', () => {
  let mockRoute: SelectedRoute;

  beforeEach(() => {
    mockRoute = {
      path: '/',
      regex: /.*/,
      params: {},
      searchParams: new URLSearchParams(),
      setSearchParams: jest.fn(),
      hash: '',
      setHash: jest.fn(),
      views: {},
      options: {},
      child: {
        path: '/child',
        regex: /.*/,
        params: {},
        searchParams: new URLSearchParams(),
        setSearchParams: jest.fn(),
        hash: '',
        setHash: jest.fn(),
        views: {},
        options: {},
        child: {
          path: '/child/grandchild',
          regex: /.*/,
          params: {},
          searchParams: new URLSearchParams(),
          setSearchParams: jest.fn(),
          hash: '',
          setHash: jest.fn(),
          views: {},
          options: {},
          child: null,
        }
      }
    } as unknown as SelectedRoute;
  });

  it('should return the initial route if depth is 0', () => {
    const result = routeDive(mockRoute, 0);
    expect(result.path).toBe(mockRoute.path);
  });

  it('should return the child route at depth 1', () => {
    const result = routeDive(mockRoute, 1);
    expect(result.path).toEqual((mockRoute.child as SelectedRoute).path);
  });

  it('should return the grandchild route at depth 2', () => {
    const result = routeDive(mockRoute, 2);
    expect(result).toEqual((mockRoute.child as SelectedRoute).child);
  });

  it('should return the deepest route available if depth is greater than nesting level', () => {
    const result = routeDive(mockRoute, 3);
    expect(result).toEqual((mockRoute.child as SelectedRoute).child);
  });

  it('should handle cases where there are no child routes', () => {
    const singleLevelRoute: SelectedRoute = {
      path: '/single',
      regex: /.*/,
      params: {},
      searchParams: new URLSearchParams(),
      setSearchParams: jest.fn(),
      hash: '',
      setHash: jest.fn(),
      views: {},
      options: {},
      child: false,
      parent: false
    };
    const result = routeDive(singleLevelRoute, 1);
    expect(result).toEqual(singleLevelRoute);
  });
});
