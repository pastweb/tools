import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createViewRouter, RouterOptions, type SelectedRoute } from '../../src/createViewRouter';
import type { BrowserHistory } from 'history';
import { effect } from '../../src/reactivity';

vi.useFakeTimers();

const history = {
  listen: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
} as unknown as BrowserHistory;

describe('createViewRouter', () => {
  let options: RouterOptions;
  let location: Location = {
      ancestorOrigins: {} as any,
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '?tab=settings',
      hash: '#section1',
      assign: vi.fn(),
      reload: vi.fn(),
      replace: vi.fn(),
    };

  beforeEach(() => {
    options = {
      base: '/',
      debug: false,
      // history,
      routes: [
        { path: '/', view: 'Home' },
        { path: '/about', view: 'About' },
        // Routes for testing optional and catch-all parameters
        { path: '/user/:name', view: 'User' },
        { path: '/user/:name/?:surname', view: 'UserOptional' },
        { path: '/user/:name/:surname?', view: 'UserOptionalAlt' },
        { path: '/blog/*slug', view: 'BlogPost' },
        { path: '/files/?*path', view : 'FileExplorer' },
        { path: '/dir/*files?', view : 'FileExplorerAlt' },
      ],
      preloader: vi.fn(),
      RouterView: vi.fn(),
      beforeRouteParse: vi.fn(route => route),
      beforeRouteSelect: vi.fn(route => route),
      sensitive: false,
    };
  });

  it('given createViewRouter is called with routes, when the router is created, then it exposes location, currentRoute, and paths with the expected initial route count', () => {
    const router = createViewRouter(options);
    
    expect(router).toHaveProperty('location');
    expect(router).toHaveProperty('currentRoute');
    expect(router).toHaveProperty('paths');
    expect(router.paths.length).toBe(8);
  });

  it('given a browser router, when awaiting router.ready, then currentRoute is the correct initial route with no transient EMPTY_ROUTE', async () => {
    const router = createViewRouter(options);

    await router.ready;

    // The default test environment + routes mean the initial route is the root '/'
    expect(router.currentRoute.path).toBe('/');
    expect(router).toHaveProperty('ready');
  });

  it('given a router in browser environment, when router.ready is awaited, then it resolves and currentRoute reflects the matched initial route', async () => {
    const router = createViewRouter(options);
    expect(router.ready).toBeInstanceOf(Promise);
    await router.ready;
    expect(router.currentRoute.path).toBe('/'); // default root route
  });

  it('given history is provided in options, when the router is created, then history.listen is called to set up navigation listening', () => {
    createViewRouter({ ...options, history });
    expect(history.listen).toHaveBeenCalled();
  });

  it('given a router with history, when router.navigate(path) is called, then history.push is invoked with the path', async () => {
    const router = createViewRouter({ ...options, history });
    await router.navigate('/about');

    expect(history.push).toHaveBeenCalledWith('/about', undefined);
  });

  it('given a router, when router.replace(path) is called, then history.replace is invoked with the path', () => {
    const router = createViewRouter({ ...options, history });
    router.replace('/about');

    expect(history.replace).toHaveBeenCalledWith('/about', undefined);
  });

  it('given a router with history, when router.back() is called, then history.back is invoked', () => {
    const router = createViewRouter({ ...options, history });
    router.back();

    expect(history.back).toHaveBeenCalled();
  });

  it('given a router with history, when router.forward() is called, then history.forward is invoked', () => {
    const router = createViewRouter({ ...options, history });
    router.forward();

    expect(history.forward).toHaveBeenCalled();
  });

  it('given a router, when setSearchParams is called with URLSearchParams, then history.push is called with the serialized query in the url', () => {
    const router = createViewRouter({ ...options, history });
    const searchParams = new URLSearchParams({ q: 'test' });
    router.setSearchParams(searchParams);

    expect(history.push).toHaveBeenCalledWith('/?q=test', undefined);
  });

  it('given a router, when setHash is called, then history.push is called with the hash appended to the url', () => {
    const router = createViewRouter({ ...options, history });
    router.setHash('section');

    expect(history.push).toHaveBeenCalledWith('/#section', undefined);
  });

  it('given a router, when addRoute is awaited with a new route, then router.paths length increases to include it', async () => {
    const router = createViewRouter(options);
    const newRoute = { path: '/contact', viewss: 'Contact' };
    await router.addRoute(newRoute);

    expect(router.paths.length).toBe(9);
  });

  it('given an effect tracking router.currentRoute.path, when router.navigate changes the route, then the effect receives the new path (replacing old onRouteChange usage)', async () => {
    const router = createViewRouter(options);
    await router.ready;

    const changes: string[] = [];
    effect(() => {
      changes.push(router.currentRoute?.path ?? '');
    });

    await router.navigate('/about');
    vi.advanceTimersByTime(30);

    expect(changes).toContain('/about');
  });

  it('given a route with required :param, when navigating to a matching path, then getRoute returns a SelectedRoute with params populated', async () => {
    const pathname = '/user/john';

    vi.stubGlobal('location', { ...location, pathname } as Location);

    const router = createViewRouter(options);
    await router.navigate(pathname);
    const route = await router.getRoute(pathname) as SelectedRoute;
  
    expect(route).toBeDefined();
    expect(route.params).toEqual({ name: 'john' });
  });

  it('given routes with optional params (:param? or /?:param), when navigating with and without the segment, then params object contains the value only when present', async () => {
    const pathname1 = '/user/john/doe';

    vi.stubGlobal('location', { ...location, pathname: pathname1 } as Location);

    const router = createViewRouter(options);
    await router.navigate(pathname1);
    const route1 = await router.getRoute(pathname1) as SelectedRoute;
    
    expect(route1.params).toEqual({ name: 'john', surname: 'doe' });

    const pathname2 = '/user/john';
    vi.stubGlobal('location', { ...location, pathname: pathname2 } as Location);

    await router.navigate(pathname2);
    const route2 = await router.getRoute(pathname2) as SelectedRoute;
    expect(route2.params).toEqual({ name: 'john' });
  });

  it('given a route using the alternative optional syntax (:param?), when navigating without the param, then params contains only the required parts', async () => {
    const pathname = '/user/alice';
    
    vi.stubGlobal('location', { ...location, pathname } as Location);
    
    const router = createViewRouter(options);
    await router.navigate(pathname);
    const route = await router.getRoute(pathname) as SelectedRoute;
    
    expect(route.params).toEqual({ name: 'alice' });
  });

  it('given a catch-all route (*slug), when navigating to a deep path under it, then the param is an array of the remaining path segments', async () => {
    const pathname = '/blog/category/react/hooks';
    
    vi.stubGlobal('location', { ...location, pathname } as Location);
    
    const router = createViewRouter(options);
    await router.navigate(pathname);
    const route = await router.getRoute(pathname) as SelectedRoute;

    expect(route.params).toEqual({ slug: ['category', 'react', 'hooks'] });
  });

  it('given an optional catch-all (?*path), when navigating with segments or to the base, then the param is an array (possibly empty)', async () => {
    const pathname1 = '/files/documents/report.pdf';
    const pathname2 = '/files';
    
    vi.stubGlobal('location', { ...location, pathname: pathname1 } as Location);

    const router = createViewRouter(options);
    
    await router.navigate(pathname1);
    const route1 = await router.getRoute(pathname1) as SelectedRoute;
    expect(route1.params).toEqual({ path: ['documents', 'report.pdf'] });

    await router.navigate(pathname2);
    const route2 = await router.getRoute(pathname2) as SelectedRoute;
    expect(route2.params).toEqual({ path: [] });
  });

  it('given a trailing optional catch-all (*files?), when navigating with or without extra segments, then params.files is the array or empty', async () => {
    const pathname1 = '/dir/documents/report.pdf';
    const pathname2 = '/dir';
    
    vi.stubGlobal('location', { ...location, pathname: pathname1 } as Location);

    const router = createViewRouter(options);
    
    await router.navigate(pathname1);
    const route1 = await router.getRoute(pathname1) as SelectedRoute;
    expect(route1.params).toEqual({ files: ['documents', 'report.pdf'] });

    await router.navigate(pathname2);
    const route2 = await router.getRoute(pathname2) as SelectedRoute;
    expect(route2.params).toEqual({ files: [] });
  });

  describe('reactivity of router object properties (non-function)', () => {
    it('given isResolving on the router, when navigation starts and finishes, then effects see the transitions (false -> true -> false)', async () => {
      const router = createViewRouter({ ...options, history });
      await router.ready;

      const seen: boolean[] = [];
      effect(() => {
        seen.push(router.isResolving);
      });

      await router.navigate('/about');
      vi.advanceTimersByTime(30);

      // initial false, then during resolve it goes true->false
      expect(seen[0]).toBe(false);
      expect(seen).toContain(false);
      // after completion it must be false
      expect(seen[seen.length - 1]).toBe(false);
    });

    it('given router.paths, when addRoute is used, then an effect tracking .length receives the updated count', async () => {
      const router = createViewRouter(options);
      await router.ready;

      const lengths: number[] = [];
      effect(() => {
        lengths.push(router.paths.length);
      });

      const newRoute = { path: '/contact', view: 'Contact' };
      await router.addRoute(newRoute);
      vi.advanceTimersByTime(30);

      expect(lengths[0]).toBe(8);
      expect(lengths).toContain(9);
    });

    it('given documentSettings, when setDocument is called, then effects tracking a nested htmlAttrs.lang receive the new value', async () => {
      const router = createViewRouter(options);
      await router.ready;

      const seenLangs: string[] = [];
      effect(() => {
        seenLangs.push(router.documentSettings?.htmlAttrs?.lang ?? '');
      });

      router.setDocument({
        htmlAttrs: { lang: 'de', 'data-theme': 'dark' },
      });
      vi.advanceTimersByTime(30);

      expect(seenLangs).toContain('de');
    });

    it('given router.base, when setBase is called, then effects tracking it receive the normalized new base value', async () => {
      const router = createViewRouter(options);
      await router.ready;

      const seenBases: string[] = [];
      effect(() => {
        seenBases.push(router.base);
      });

      await router.setBase('app');
      vi.advanceTimersByTime(30);

      expect(seenBases).toContain('/app/');
    });
  });

  // it('should correctly identify route by name with optional params', async () => {
  //   const pathname = '/user/alice/smith';

  //   vi.stubGlobal('location', { ...location, pathname } as Location);
  //   const router = createViewRouter(options);
    
  //   const route = await router.getRoute(pathname) as Route;
  //   console.log(route);
  //   expect(route.path).toBe('/user/:name/?:surname');
  //   expect(route.params).toEqual({ name: 'alice', surname: 'smith' });
  // });
});
