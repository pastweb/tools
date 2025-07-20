import { match, pathToRegexp } from 'path-to-regexp';
import { createEventEmitter, RemoveListener } from '../createEventEmitter';
import {
  normalizeOptions,
  getLocation,
  normalizePath,
  normalizeRoute,
  normalizeRouteParamValue,
} from './util';
import { EMPTY_ROUTE } from './constants';
import type {
  ViewRouter,
  RouterOptions,
  Route,
  ParsedRoute,
  SelectedRoute,
  RouterLinkOptions,
  RouterLink,
} from './types';

/**
 * Creates a view router with the specified options.
 * 
 * @param options - The router options.
 * @returns The created view router.
 */
export function createViewRouter(options: RouterOptions): ViewRouter {
  const _options = normalizeOptions(options);
  const {
    base,
    debug,
    history,
    routes,
    preloader,
    href,
    RouterView,
    beforeRouteParse,
    beforeRouteSelect,
    sensitive,
  } = _options;

  const _emitter = createEventEmitter();
  let _location = getLocation(href);

  let _baseInit = true;
  let _base = base;
  setBase(base);
  let _paths = routes.map(route => normalizePath(_base, route));
  let _parsedRoutes = _paths.map(route => parseRoute(route));

  let _currentRoute: SelectedRoute = EMPTY_ROUTE;

  history.listen(() => {
    _location = getLocation(window.location.href);
    _currentRoute = getRoute() || EMPTY_ROUTE;
    _emitter.emit('routeChanged', _currentRoute);

    if (debug) {
      console.log(`[router](current route) ->`, _currentRoute);
    }
  });

  const current = getRoute();

  if (current) {
    _currentRoute = current;
  }

  if (debug) {
    console.log(`[router](paths) ->`, _paths);
    console.log(`[router](parsed routes) ->`, _parsedRoutes);
    console.log(`[router](current route) ->`, _currentRoute);
  }

  const router = {
    location: _location,
    currentRoute: _currentRoute,
    paths: _paths,
    back: history.back,
    forward: history.forward,
    preloader,
    setBase,
    addRoute,
    onRouteChange,
    onRouteAdded,
    navigate,
    push,
    replace,
    go,
    setSearchParams,
    setHash,
    getRouterLink,
  };

  Object.defineProperties(router, {
    location: {
      get() { return _location; },
    },
    currentRoute: {
      get() { return _currentRoute; },
    },
    paths: {
      get() { return _paths; },
    },
  });

  /**
   * Parses a route into a parsed route.
   * 
   * @param route - The route to parse.
   * @param start - A flag indicating whether the route is the start route.
   * @returns The parsed route.
   */
  function parseRoute(route: Route, start: boolean = true): ParsedRoute {
    const normalized = normalizeRoute(RouterView, route);
    const before = beforeRouteParse ? beforeRouteParse(normalized) : normalized;
    const { path, redirect, views = {}, children = [], ...rest } = before;

    let { regexp } = pathToRegexp(path, { end: !children.length, sensitive });

    if (!start) regexp = new RegExp(regexp.source.substring(1));

    const options = { ...redirect ? { redirect } : {}, ...rest };
    
    return { path, regexp, views, options, children: children.map(route => parseRoute(route, false)) };
  }

  /**
   * Sets the base path for the router.
   * 
   * @param base - The base path.
   */
  function setBase(base: string = ''): void {
    base = !base || base === '/' ? '/' : `/${base.replace(/(^\/)|(\/$)/g, '').replace(/\/+/g, '/')}/`;

    if (_baseInit) {
      _baseInit = false;
    } else {
      _paths = _paths.map(({ path, redirect, ...rest }) => ({
        path: `${_base}${path.replace(_base, base)}`,
        ...redirect ? { redirect: `${_base}${redirect.replace(_base, base)}` } : {},
        ...rest
      }));
      
      _parsedRoutes = _parsedRoutes.map(({ path, options: { redirect, ...restOptions }, ...rest }) => ({
        path: `${_base}${path.replace(_base, base)}`,
        options: {
          ...redirect ? { redirect: `${_base}${redirect.replace(_base, base)}` } : {},
          ...restOptions
        },
        ...rest
      }));

      _currentRoute = getRoute() || EMPTY_ROUTE;
      _emitter.emit('routeChanged', _currentRoute);
    }

    _base = base;
  }

  /**
   * Gets the current route based on the pathname.
   * 
   * @param pathname - The pathname to match.
   * @returns The selected route or false if no match is found.
   */
  function getRoute(pathname: string = _location.pathname): SelectedRoute | false {
    const selected = findRoute(pathname, _parsedRoutes);

    if (typeof selected !== 'boolean') {
      return selected as SelectedRoute;
    }

    if (!selected) {
      console.warn(`Router warning - no any route config found for ${pathname}`);
    }

    return false;
  }

  /**
   * Finds a matching route based on the pathname.
   * 
   * @param pathname - The pathname to match.
   * @param routes - The list of parsed routes.
   * @param parent - The parent route.
   * @param params - The route parameters.
   * @returns The selected route or boolean.
   */
  function findRoute(
    pathname: string,
    routes: ParsedRoute[],
    parent: SelectedRoute | false = false,
    params: Record<string, any> = {}
  ): SelectedRoute | boolean {
    let selected: SelectedRoute | boolean = false;

    for (const route of routes) {
      selected = handleRoute(pathname, route, parent, params);

      if (selected) break;
    }

    return selected;
  }

  /**
   * Handles the route matching and selection.
   * 
   * @param pathname - The pathname to match.
   * @param route - The parsed route.
   * @param parent - The parent route.
   * @param params - The route parameters.
   * @returns The selected route or boolean.
   */
  function handleRoute(
    pathname: string,
    route: ParsedRoute,
    parent: SelectedRoute | false = false,
    params: Record<string, any>
  ): SelectedRoute | boolean {
    const { path, regexp, views, options, children } = route;
    const { redirect } = options;

    if (regexp.test(pathname)) {
      const matchFn = match(path, { decode: decodeURIComponent });
      const matchResult = matchFn(pathname);

      if (matchResult) {
        const matchParams = Object.entries(matchResult.params).reduce((acc, [name, value]) => ({
          ...acc,
          [name]: normalizeRouteParamValue(value as string),
        }), {});

        params = { ...params, ...matchParams };
      }
      
      const { hash, searchParams } = _location;

      let selected: SelectedRoute = {
        parent,
        regexp,
        path,
        params,
        searchParams,
        setSearchParams: (searchParams: URLSearchParams) => setSearchParams(searchParams),
        hash,
        setHash: (hash?: string) => setHash(hash),
        views,
        options,
        child: false,
      };
      
      selected.child = findRoute(pathname, children, selected, params);

      if (beforeRouteSelect) {
        selected = beforeRouteSelect(selected);
      }

      if (redirect) {
        navigate(redirect);
        return true;
      }

      return selected;
    }

    return false;
  }

  /**
   * Adds a new route to the router.
   * 
   * @param route - The route to add.
   */
  function addRoute(route: Route): void {
    const normalized = normalizePath(_base, route);
    _paths.push(normalized);
    _parsedRoutes.push(parseRoute(normalized));
    _emitter.emit('routeAdded', _paths);
  }

  /**
   * Subscribes to route change events.
   * 
   * @param fn - The callback function to execute on route change.
   * @returns The remove listener function.
   */
  function onRouteChange(fn: (route: SelectedRoute) => void): RemoveListener {
    return _emitter.on('routeChanged', fn);
  }

  /**
   * Subscribes to route added events.
   * 
   * @param fn - The callback function to execute when a route is added.
   * @returns The remove listener function.
   */
  function onRouteAdded(fn: (routes: Route[]) => void): RemoveListener {
    return _emitter.on('routeAdded', fn);
  }

  /**
   * Navigates to the specified path.
   * 
   * @param path - The path to navigate to.
   * @param state - The state to pass to the navigation.
   */
  function navigate(path: string, state?: any): void {
    history.push(path, state);
  }

  /**
   * Pushes a new entry onto the history stack.
   * 
   * @param path - The path to push.
   * @param state - The state to pass to the navigation.
   */
  function push(path: string, state?: any): void {
    navigate(path, state);
  }

  /**
   * Replaces the current entry on the history stack.
   * 
   * @param path - The path to replace.
   * @param state - The state to pass to the navigation.
   */
  function replace(path: string, state?: any): void {
    history.replace(path, state);
  }

  /**
   * Moves the history stack by the specified delta.
   * 
   * @param delta - The number of entries to move.
   */
  function go(delta: number): void {
    history.go(delta);
  }

  /**
   * Sets the search parameters for the current location.
   * 
   * @param searchParams - The search parameters to set.
   */
  function setSearchParams(searchParams: URLSearchParams): void {
    const { pathname, hash } = _location;
    const searchStr = searchParams.toString();
    const to = `${pathname}${searchStr ? `?${searchStr}` : ''}${hash ? `#${hash}` : ''}`;
    navigate(to);
  }

  /**
   * Sets the hash for the current location.
   * 
   * @param hash - The hash to set.
   */
  function setHash(hash?: string): void {
    const { pathname, searchParams } = _location;
    const searchStr = searchParams.toString();
    const to = `${pathname}${searchStr ? `?${searchStr}` : ''}${hash ? `#${hash}` : ''}`;
    navigate(to);
  }

  /**
   * Gets a router link with the specified options.
   * 
   * @param options - The router link options.
   * @returns The created router link.
   */
  function getRouterLink({ path, params = {}, searchParams, hash }: RouterLinkOptions): RouterLink {
    // apply the params to the path description
    path = Object.entries(params || {}).reduce((acc, [prop, value]) => {
      return acc.replace(new RegExp(`((\\()?|(\\(\\/))?\:${prop}(\\)?\\?)?`), `${value}`);
    }, path);

    // cut the path from the first parameter description is it exsists
    path.replace(/\/?((\()?|(\(\/))?\:[^\/]+(\)?\?)?.*/, '');

    // apply search params
    const search = searchParams ? `${path.split('?')[0]}?${searchParams.toString()}` : '';

    // apply hash
    path = `${path}${search}${hash ? `#${hash}` : ''}`;

    const { regexp: isActiveRE } = pathToRegexp(path, { end: false, sensitive });
    const { regexp: isExactActiveRE } = pathToRegexp(path, { end: true, sensitive });
    
    const { pathname } = _location;

    return {
      pathname: path,
      isActive: isActiveRE.test(pathname),
      isExactActive: isExactActiveRE.test(pathname),
      navigate: (to?: string) => navigate(to || path),
    };
  }

  return router;
}
