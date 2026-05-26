import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createViewRouter, RouterOptions, type Route } from '../../src/createViewRouter';
import type { BrowserHistory } from 'history';

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

  it('should create a router with initial state', () => {
    const router = createViewRouter(options);
    
    expect(router).toHaveProperty('location');
    expect(router).toHaveProperty('currentRoute');
    expect(router).toHaveProperty('paths');
    expect(router.paths.length).toBe(8);
  });

  it('should call history listen method', () => {
    createViewRouter({ ...options, history });
    expect(history.listen).toHaveBeenCalled();
  });

  it('should navigate to a new path', async () => {
    const router = createViewRouter({ ...options, history });
    await router.navigate('/about');

    expect(history.push).toHaveBeenCalledWith('/about', undefined);
  });

  it('should replace the current path', () => {
    const router = createViewRouter({ ...options, history });
    router.replace('/about');

    expect(history.replace).toHaveBeenCalledWith('/about', undefined);
  });

  it('should go back in history', () => {
    const router = createViewRouter({ ...options, history });
    router.back();

    expect(history.back).toHaveBeenCalled();
  });

  it('should go forward in history', () => {
    const router = createViewRouter({ ...options, history });
    router.forward();

    expect(history.forward).toHaveBeenCalled();
  });

  it('should set search params correctly', () => {
    const router = createViewRouter({ ...options, history });
    const searchParams = new URLSearchParams({ q: 'test' });
    router.setSearchParams(searchParams);

    expect(history.push).toHaveBeenCalledWith('/?q=test', undefined);
  });

  it('should set hash correctly', () => {
    const router = createViewRouter({ ...options, history });
    router.setHash('section');

    expect(history.push).toHaveBeenCalledWith('/#section', undefined);
  });

  it('should add a new route', async () => {
    const router = createViewRouter(options);
    const newRoute = { path: '/contact', viewss: 'Contact' };
    await router.addRoute(newRoute);

    expect(router.paths.length).toBe(9);
  });

  it('should emit route change event', async () => {
    const router = createViewRouter(options);
    const routeChangeListener = vi.fn();
    router.onRouteChange(routeChangeListener);

    await router.navigate('/about');

    expect(routeChangeListener).toHaveBeenCalled();
  }); 

  it('should emit route added event', async () => {
    const router = createViewRouter(options);
    const routeAddedListener = vi.fn();
    router.onRouteAdded(routeAddedListener);

    const newRoute = { path: '/contact', view: 'Contact' };
    await router.addRoute(newRoute);

    expect(routeAddedListener).toHaveBeenCalledWith(expect.arrayContaining([newRoute]));
  });

  it('should match required parameter', async () => {
    const pathname = '/user/john';

    vi.stubGlobal('location', { ...location, pathname } as Location);

    const router = createViewRouter(options);
    await router.navigate(pathname);
    const route = await router.getRoute(pathname);
  
    expect(route).toBeDefined();
    expect((route as Route).params).toEqual({ name: 'john' });
  });

  it('should match optional parameter with value', async () => {
    const pathname1 = '/user/john/doe';

    vi.stubGlobal('location', { ...location, pathname: pathname1 } as Location);

    const router = createViewRouter(options);
    await router.navigate(pathname1);
    const route1 = await router.getRoute(pathname1) as Route;
    
    expect(route1?.params).toEqual({ name: 'john', surname: 'doe' });

    const pathname2 = '/user/john';
    vi.stubGlobal('location', { ...location, pathname: pathname2 } as Location);

    await router.navigate(pathname2);
    const route2 = await router.getRoute(pathname2) as Route;
    expect(route2?.params).toEqual({ name: 'john' });
  });

  it('should match optional parameter using alternative syntax (:param?)', async () => {
    const pathname = '/user/alice';
    
    vi.stubGlobal('location', { ...location, pathname } as Location);
    
    const router = createViewRouter(options);
    await router.navigate(pathname);
    const route = await router.getRoute(pathname) as Route;
    
    expect(route.params).toEqual({ name: 'alice' });
  });

  it('should match catch-all parameter (*slug)', async () => {
    const pathname = '/blog/category/react/hooks';
    
    vi.stubGlobal('location', { ...location, pathname } as Location);
    
    const router = createViewRouter(options);
    await router.navigate(pathname);
    const route = await router.getRoute(pathname) as Route;

    expect(route.params).toEqual({ slug: ['category', 'react', 'hooks'] });
  });

  it('should match optional catch-all parameter (?*path)', async () => {
    const pathname1 = '/files/documents/report.pdf';
    const pathname2 = '/files';
    
    vi.stubGlobal('location', { ...location, pathname: pathname1 } as Location);

    const router = createViewRouter(options);
    
    await router.navigate(pathname1);
    const route1 = await router.getRoute(pathname1) as Route;
    expect(route1.params).toEqual({ path: ['documents', 'report.pdf'] });

    await router.navigate(pathname2);
    const route2 = await router.getRoute(pathname2) as Route;
    expect(route2.params).toEqual({ path: [] });
  });

  it('should match optional catch-all parameter (*files?)', async () => {
    const pathname1 = '/dir/documents/report.pdf';
    const pathname2 = '/dir';
    
    vi.stubGlobal('location', { ...location, pathname: pathname1 } as Location);

    const router = createViewRouter(options);
    
    await router.navigate(pathname1);
    const route1 = await router.getRoute(pathname1) as Route;
    expect(route1.params).toEqual({ files: ['documents', 'report.pdf'] });

    await router.navigate(pathname2);
    const route2 = await router.getRoute(pathname2) as Route;
    expect(route2.params).toEqual({ files: [] });
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
