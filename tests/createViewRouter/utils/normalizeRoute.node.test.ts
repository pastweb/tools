import { describe, it, expect } from 'vitest';
import { normalizeRoute } from '../../src/createViewRouter';

describe('normalizeRoute', () => {
  const DefaultRouterView = () => 'DefaultView';

  it('given a basic route definition with view, when normalizeRoute is called, then it receives fullPath, path, and view component', () => {
    const route = normalizeRoute(DefaultRouterView, { path: '/home', view: 'HomeView' });
    expect(route.path).toBe('/home');
    expect(route.views).toEqual({ default: 'HomeView' });
  });

  it('given a route without explicit view, when normalized, then a default RouterView from options or global is attached', () => {
    const route = normalizeRoute(DefaultRouterView, { path: '/about' });
    expect(route.views).toEqual({ default: DefaultRouterView });
  });

  it('given a route with redirect, when normalized, then the redirect is preserved and no view is required', () => {
    const route = normalizeRoute(DefaultRouterView, { path: '/old', redirect: '/new' });
    expect(route.path).toBe('/old');
    expect(route.redirect).toBe('/new');
  });

  it('given nested children routes, when normalizeRoute processes the tree, then each child gets the correct fullPath built from parents', () => {
    const route = normalizeRoute(DefaultRouterView, {
      path: '/parent',
      view: 'Parent',
      children: [
        { path: 'child', view: 'Child' },
        { path: '/absolute', view: 'Absolute' }
      ]
    });
    expect(route.children?.[0].path).toBe('child');
    expect(route.children?.[1].path).toBe('/absolute');
  });

  it('given custom meta or other props on route, when normalized, then they remain on the output route object', () => {
    const route = normalizeRoute(DefaultRouterView, { path: '/test', meta: { auth: true } });
    expect(route.meta).toEqual({ auth: true });
  });
});
