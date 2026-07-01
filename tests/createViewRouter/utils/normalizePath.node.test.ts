import { describe, it, expect } from 'vitest';
import { normalizePath } from '../../../src/createViewRouter/utils';

describe('normalizePath', () => {
  it('given a path and a base, when normalizePath is called, then the path is joined correctly under the base with proper slashes', () => {
    const route = normalizePath('/app', { path: '/home' });
    expect(route.path).toBe('/app/home');
  });

  it('given paths with various leading/trailing slashes, when normalized, then the result has a single leading / and no trailing / (except root)', () => {
    const route = normalizePath('/', { path: '/about/' });
    expect(route.path).toBe('/about');
  });

  it('given a redirect route with base, when normalized, then the redirect target is also adjusted relative to base', () => {
    const route = normalizePath('/app', { path: '/old', redirect: '/new' });
    expect(route.redirect).toBe('/app/new');
  });

  it('given a route with nested children, when normalizePath runs, then children get fullPath computed correctly', () => {
    const route = normalizePath('/app', {
      path: '/parent',
      children: [
        { path: 'child' },
        { path: '/absolute-child' }
      ]
    });
    expect(route.children?.[0].path).toBe('/app/parent/child');
    expect(route.children?.[1].path).toBe('/app/absolute-child');
  });

  it('given extra properties on a route, when normalized, then they are carried over unchanged', () => {
    const route = normalizePath('/', { path: '/home', view: 'Home', meta: { title: 'Home' } });
    expect(route.view).toBe('Home');
    expect(route.meta).toEqual({ title: 'Home' });
  });
});
