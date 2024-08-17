import { createViewRouter, RouterOptions } from '../../src/createViewRouter';
import type { BrowserHistory } from 'history';

const history = {
  listen: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  go: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
} as unknown as BrowserHistory;

describe('createViewRouter', () => {
  let options: RouterOptions;

  beforeEach(() => {
    options = {
      base: '/',
      debug: false,
      // history,
      routes: [
        { path: '/', component: 'Home' },
        { path: '/about', component: 'About' },
      ],
      preloader: jest.fn(),
      href: '/',
      RouterView: jest.fn(),
      beforeRouteParse: jest.fn(route => route),
      beforeRouteSelect: jest.fn(route => route),
      sensitive: false,
    };
  });

  it('should create a router with initial state', () => {
    const router = createViewRouter(options);
    
    expect(router).toHaveProperty('location');
    expect(router).toHaveProperty('currentRoute');
    expect(router).toHaveProperty('paths');
    expect(router.paths.length).toBe(2);
  });

  it('should call history listen method', () => {
    createViewRouter({ ...options, history });
    expect(history.listen).toHaveBeenCalled();
  });

  it('should navigate to a new path', () => {
    const router = createViewRouter({ ...options, history });
    router.navigate('/about');

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

  it('should add a new route', () => {
    const router = createViewRouter(options);
    const newRoute = { path: '/contact', component: 'Contact' };
    router.addRoute(newRoute);

    expect(router.paths.length).toBe(3);
  });

  it('should emit route change events', () => {
    const router = createViewRouter(options);
    const routeChangeListener = jest.fn();
    router.onRouteChange(routeChangeListener);

    router.navigate('/about');

    expect(routeChangeListener).toHaveBeenCalled();
  });

  it('should emit route added events', () => {
    const router = createViewRouter(options);
    const routeAddedListener = jest.fn();
    router.onRouteAdded(routeAddedListener);

    const newRoute = { path: '/contact', component: 'Contact' };
    router.addRoute(newRoute);

    expect(routeAddedListener).toHaveBeenCalledWith(expect.arrayContaining([newRoute]));
  });
});
