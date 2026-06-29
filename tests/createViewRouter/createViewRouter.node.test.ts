import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createViewRouter, RouterOptions } from '../../src/createViewRouter';

describe('createViewRouter (server / SSR)', () => {
  let options: RouterOptions;

  beforeEach(() => {
    options = {
      base: '/',
      debug: false,
      // No history for pure server tests
      routes: [
        { path: '/', view: 'Home' },
        { path: '/about', view: 'About' },
        // Routes for testing optional and catch-all parameters
        { path: '/user/:name', view: 'User' },
        { path: '/user/:name/?:surname', view: 'UserOptional' },
        { path: '/user/:name/:surname?', view: 'UserOptionalAlt' },
        { path: '/blog/*slug', view: 'BlogPost' },
        { path: '/files/?*path', view: 'FileExplorer' },
        { path: '/dir/*files?', view: 'FileExplorerAlt' },
      ],
      preloader: vi.fn(),
      RouterView: vi.fn(),
      beforeRouteParse: vi.fn(route => route),
      beforeRouteSelect: vi.fn(route => route),
      sensitive: false,
    };
  });

  it('given createViewRouter in SSR without initialRequest, when the router is constructed, then it has location/paths but currentRoute starts empty (no auto init)', () => {
    const router = createViewRouter(options);

    expect(router).toHaveProperty('location');
    expect(router).toHaveProperty('currentRoute');
    expect(router).toHaveProperty('paths');
    expect(router.paths.length).toBe(8);

    // On the server (!isBrowser), constructor does not auto-run initialSetup.
    // currentRoute starts as EMPTY_ROUTE (path: '').
    // Note: getLocation('') produces pathname: '/' as the normalized root.
    expect(router.currentRoute.path).toBe('');
    expect(router.location.pathname).toBe('/');
  });

  it('given initialRequest in SSR options, when router.ready is awaited, then currentRoute is immediately the correctly matched route without EMPTY_ROUTE transient', async () => {
    const router = createViewRouter({
      ...options,
      initialRequest: {
        url: 'http://localhost:3000/about',
        method: 'GET',
        headers: { 'user-agent': 'ssr-ready-test' },
      } as any,
    });

    // This is the key: after awaiting ready, currentRoute is guaranteed correct
    // from the first assignment the consumer makes.
    await router.ready;

    expect(router.currentRoute.path).toBe('/about');
    expect(router.location.pathname).toBe('/about');
    expect(router.request.userAgent).toBe('ssr-ready-test');

    // Derived fields (no language or color hints in this request)
    expect(router.request.language).toBe('');
    expect(router.request.os).toBe('Unknown');
    expect(router.request.colorScheme).toBe('no-preference');
  });

  it('given an SSR router, when setRequest is called with a server request, then currentRoute and location become populated for the matched route', async () => {
    const router = createViewRouter(options);

    const fakeReq = {
      url: 'http://localhost:3000/about?tab=info#section',
      method: 'GET',
      headers: { 'user-agent': 'node-ssr-test', 'x-forwarded-for': '127.0.0.1' },
    } as any;

    await router.setRequest(fakeReq);

    expect(router.request.userAgent).toBe('node-ssr-test');
    expect(router.location.pathname).toBe('/about');
    expect(router.location.searchParams.get('tab')).toBe('info');
    expect(router.currentRoute.path).toBe('/about');
    expect(router.currentRoute.params).toEqual({});

    // New derived fields from server request
    expect(router.request.language).toBe('');
    expect(router.request.os).toBe('Unknown'); // no user-agent in this fake
    expect(router.request.colorScheme).toBe('no-preference');
  });

  it('given an initialRequest with client hint headers and cookies, when the router processes it, then server-derived fields (language, os with version, colorScheme) are populated on the request', async () => {
    const router = createViewRouter(options);

    const fakeReq = {
      url: 'http://localhost:3000/dashboard',
      method: 'GET',
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'sec-ch-prefers-color-scheme': 'dark',
      },
      // simulate a cookie fallback
      cookie: 'prefers-color-scheme=light; other=foo',
    } as any;

    await router.setRequest(fakeReq);

    expect(router.request.language).toBe('fr-FR');
    expect(router.request.os).toBe('macOS 10.15.7');
    // Client hint takes priority over cookie
    expect(router.request.colorScheme).toBe('dark');

    // Test Windows version mapping
    const winReq = {
      url: 'http://localhost:3000/',
      method: 'GET',
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    } as any;
    await router.setRequest(winReq);
    expect(router.request.os).toBe('Windows 10/11');

    // Test iOS version
    const iosReq = {
      url: 'http://localhost:3000/',
      method: 'GET',
      headers: { 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15' },
    } as any;
    await router.setRequest(iosReq);
    expect(router.request.os).toBe('iOS 17.2');

    // Test Android version
    const androidReq = {
      url: 'http://localhost:3000/',
      method: 'GET',
      headers: { 'user-agent': 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36' },
    } as any;
    await router.setRequest(androidReq);
    expect(router.request.os).toBe('Android 14');
  });

  it('given a required param route, when setRequest matches a path with the param, then the resulting route.params contains it', async () => {
    const pathname = '/user/john';

    const router = createViewRouter(options);
    const fakeReq = {
      url: `http://localhost:3000${pathname}`,
      method: 'GET',
      headers: {},
    } as any;

    await router.setRequest(fakeReq);

    expect(router.currentRoute.params).toEqual({ name: 'john' });
  });

  it('given optional param routes, when setRequest is used with paths that include or omit the optional segment, then params reflect presence/absence correctly', async () => {
    const pathname1 = '/user/john/doe';

    const router = createViewRouter(options);
    const fakeReq1 = {
      url: `http://localhost:3000${pathname1}`,
      method: 'GET',
      headers: {},
    } as any;

    await router.setRequest(fakeReq1);
    expect(router.currentRoute.params).toEqual({ name: 'john', surname: 'doe' });

    const pathname2 = '/user/john';
    const fakeReq2 = {
      url: `http://localhost:3000${pathname2}`,
      method: 'GET',
      headers: {},
    } as any;

    await router.setRequest(fakeReq2);
    expect(router.currentRoute.params).toEqual({ name: 'john' });
  });

  it('given the alternative optional syntax, when matching via setRequest, then params are extracted as expected', async () => {
    const pathname = '/user/alice';

    const router = createViewRouter(options);
    const fakeReq = {
      url: `http://localhost:3000${pathname}`,
      method: 'GET',
      headers: {},
    } as any;

    await router.setRequest(fakeReq);

    expect(router.currentRoute.params).toEqual({ name: 'alice' });
  });

  it('given a * catch-all, when setRequest provides a deep path, then the param is the split array of segments', async () => {
    const pathname = '/blog/category/react/hooks';

    const router = createViewRouter(options);
    const fakeReq = {
      url: `http://localhost:3000${pathname}`,
      method: 'GET',
      headers: {},
    } as any;

    await router.setRequest(fakeReq);

    expect(router.currentRoute.params).toEqual({ slug: ['category', 'react', 'hooks'] });
  });

  it('given an optional ?* catch-all, when setRequest matches paths with or without extra segments, then the param array is populated or empty accordingly', async () => {
    const router = createViewRouter(options);

    const fakeReq1 = {
      url: 'http://localhost:3000/files/documents/report.pdf',
      method: 'GET',
      headers: {},
    } as any;
    await router.setRequest(fakeReq1);
    expect(router.currentRoute.params).toEqual({ path: ['documents', 'report.pdf'] });

    const fakeReq2 = {
      url: 'http://localhost:3000/files',
      method: 'GET',
      headers: {},
    } as any;
    await router.setRequest(fakeReq2);
    expect(router.currentRoute.params).toEqual({ path: [] });
  });

  it('given a *? optional catch-all at end, when setRequest is used, then params contain the array or empty list', async () => {
    const router = createViewRouter(options);

    const fakeReq1 = {
      url: 'http://localhost:3000/dir/documents/report.pdf',
      method: 'GET',
      headers: {},
    } as any;
    await router.setRequest(fakeReq1);
    expect(router.currentRoute.params).toEqual({ files: ['documents', 'report.pdf'] });

    const fakeReq2 = {
      url: 'http://localhost:3000/dir',
      method: 'GET',
      headers: {},
    } as any;
    await router.setRequest(fakeReq2);
    expect(router.currentRoute.params).toEqual({ files: [] });
  });

  it('given an SSR router, when initialSetup is called explicitly, then the router initializes the current route from the provided request-like object', async () => {
    const router = createViewRouter(options);

    // In SSR you are responsible for calling initialSetup (or preferably setRequest).
    // Calling it here will match against the initial location derived from getLocation(''),
    // which normalizes to pathname '/'. There is a route for it.
    await router.initialSetup();

    expect(router.currentRoute.path).toBe('/');
  });

  it('given plain SSR creation (no initialRequest), when router.ready is awaited, then it resolves promptly and manual init via setRequest or initialSetup is still possible', async () => {
    const router = createViewRouter(options);
    // ready resolves immediately when no auto-init is configured
    await router.ready;
    expect(router.currentRoute.path).toBe(''); // still empty until manual init

    const fakeReq = {
      url: 'http://localhost:3000/about',
      method: 'GET',
      headers: {},
    } as any;
    await router.setRequest(fakeReq);
    expect(router.currentRoute.path).toBe('/about');
  });

  it('given an SSR router, when addRoute is called, then paths are updated on the server instance as well', async () => {
    const router = createViewRouter(options);
    const newRoute = { path: '/contact', view: 'Contact' };
    await router.addRoute(newRoute);

    expect(router.paths.length).toBe(9);
  });
});
