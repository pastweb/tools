// import { match, pathToRegexp } from 'path-to-regexp';
import { createEventEmitter, type RemoveListener } from '../createEventEmitter';
import { isObject } from '../isObject';
import { noop } from '../noop';
import { isSSR } from '../isSSR';
import {
  normalizeOptions,
  getLocation,
  normalizePath,
  normalizeRoute,
  pathMatch,
  pathToRegExp,
  normalizeServerRequest,
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
  NodeRequest,
  ServerRequest,
  DocumentSettings,
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
    RouterView,
    beforeRouteParse = noop,
    beforeRouteSelect = noop,
    sensitive,
  } = _options;

  const _emitter = createEventEmitter();
  let _location = getLocation(isSSR ? '' : window.location.href, isSSR ? '' : navigator && (navigator as any).userAgent as string);

  let _baseInit = true;
  let _base = base;
  setBase(base);
  let _paths = routes.map(route => normalizePath(_base, route));
  let _parsedRoutes: ParsedRoute[] = [];
  let _currentRoute: SelectedRoute = EMPTY_ROUTE;
  let _isResolving = false;
  let _request: ServerRequest = {} as ServerRequest; // Placeholder for SSR request, will be set via setRequest method

  // =============================================================
  // INITIAL ASYNC SETUP
  // =============================================================
  async function initialSetup() {
    _parsedRoutes = await Promise.all(_paths.map(route => parseRoute(route)));
    const current = await getRoute();
    if (current) _currentRoute = current;

    if (debug) {
      console.log(`[router](paths) ->`, _paths);
      console.log(`[router](parsed routes) ->`, _parsedRoutes);
      console.log(`[router](current route) ->`, _currentRoute);
    }
  }

  if (!isSSR) {
    (async () => {
      await initialSetup();
    })();
  }

  // =============================================================
  // Helper: refresh current route after navigation
  // =============================================================
  async function refreshCurrentRoute(): Promise<void> {
    _isResolving = true;
    try {
      const newRoute = await getRoute();
      _currentRoute = newRoute || EMPTY_ROUTE;
      _emitter.emit('routeChanged', _currentRoute);

      if (debug) {
        console.log(`[router](current route) ->`, _currentRoute);
      }
    } finally {
      _isResolving = false;
    }
  }

  if (history && !isSSR) {
    history.listen(() => {
      _location = getLocation(window.location.href, navigator && (navigator as any).userAgent as string);
      refreshCurrentRoute();
    });
  }

  const router = {
    location: _location,
    currentRoute: _currentRoute,
    paths: _paths,
    request: _request,
    isResolving: _isResolving,
    back: history ? history.back : noop,
    forward: history ? history.forward : noop,
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
    getRoute,
    setRequest,
    setDocument,
    documentSettings: {
      htmlAttrs: {},
      head: {},
      bodyAttrs: {},
    },
  };

  Object.defineProperties(router, {
    currentRoute: { get() { return _currentRoute; } },
    location: { get() { return _location; } },
    isResolving: { get() { return _isResolving; } },
    paths: { get() { return _paths; } },
    request: { get() { return _request; } },  
  });

  /**
   * Parses a route into a parsed route.
   * 
   * @param route - The route to parse.
   * @param start - A flag indicating whether the route is the start route.
   * @returns The parsed route.
   */
  async function parseRoute(route: Route, start: boolean = true): Promise<ParsedRoute> {
    const normalized = normalizeRoute(RouterView, route);
    const result = await Promise.resolve(beforeRouteParse(normalized));
    const parsed: Route = isObject(result) ? result : normalized;
    let { path, redirect, views = {}, children = [], ...rest } = parsed;

    path = start && !path.startsWith('/') ? `/${path}` : path;
    path = path.replace(/\/+/g, '/');

    const end = !children || children.length === 0;

    const regexp = pathToRegExp(path, { start, end, sensitive });

    const options = { ...redirect ? { redirect } : {}, ...rest };

    return { 
      path, 
      regexp, 
      views, 
      options, 
      children: await Promise.all(children.map(child => parseRoute(child, false))) 
    };
  }

  /**
   * Sets the base path for the router.
   * 
   * @param newBase - The new base path.
   */
  async function setBase(newBase: string = ''): Promise<void> {
    _base = !newBase || newBase === '/' 
      ? '/' 
      : `/${newBase.replace(/(^\/)|(\/$)/g, '').replace(/\/+/g, '/')}/`;

    if (_baseInit) {
      _baseInit = false;
      return;
    }

    _paths = _paths.map(({ path, redirect, ...rest }) => ({
      path: `${_base}${path.replace(_base, _base)}`,
      ...redirect ? { redirect: `${_base}${redirect.replace(_base, _base)}` } : {},
      ...rest,
    }));

    _parsedRoutes = await Promise.all(_paths.map(route => parseRoute(route)));

    const current = await getRoute();
    _currentRoute = current || EMPTY_ROUTE;
    _emitter.emit('routeChanged', _currentRoute);
  }

  /**
   * Gets the current route based on the pathname.
   * 
   * @param pathname - The pathname to match.
   * @returns The selected route or false if no match is found.
   */
  async function getRoute(pathname: string = _location.pathname): Promise<SelectedRoute | false> {
    const selected = await findRoute(pathname, _parsedRoutes);

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
  async function findRoute(
    pathname: string,
    routes: ParsedRoute[],
    parent: SelectedRoute | false = false,
    params: Record<string, any> = {}
  ): Promise<SelectedRoute | boolean> {
    for (const route of routes) {
      const selected = await handleRoute(pathname, route, parent, params);
      if (selected) return selected;
    }
    return false;
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
  async function handleRoute(
    pathname: string,
    route: ParsedRoute,
    parent: SelectedRoute | false = false,
    params: Record<string, any>
  ): Promise<SelectedRoute | boolean> {
    const { path, regexp, views, options, children } = route;
    const { redirect } = options;
    
    const mathchParams = pathMatch(path, regexp, pathname);

    if (mathchParams) {
      params = { ...params, ...mathchParams };
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

      selected.child = await findRoute(pathname, children, selected, params);
      const result = await Promise.resolve(beforeRouteSelect(selected));
      selected = isObject(result) ? result : selected;

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
  async function addRoute(route: Route): Promise<void> {
    const normalized = normalizePath(_base, route);
    _paths.push(normalized);
    const parsed = await parseRoute(normalized);
    _parsedRoutes.push(parsed);
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
  async function navigate(path: string, state?: any): Promise<void> {
    if (history && !isSSR) history.push(path, state);
    await refreshCurrentRoute();
  }

  /**
   * Pushes a new entry onto the history stack.
   * 
   * @param path - The path to push.
   * @param state - The state to pass to the navigation.
   */
  async function push(path: string, state?: any): Promise<void> {
    return navigate(path, state);
  }

  /**
   * Replaces the current entry on the history stack.
   * 
   * @param path - The path to replace.
   * @param state - The state to pass to the navigation.
   */
  function replace(path: string, state?: any): void {
    if (history && !isSSR) history.replace(path, state);
    refreshCurrentRoute();
  }

  /**
   * Moves the history stack by the specified delta.
   * 
   * @param delta - The number of entries to move.
   */
  function go(delta: number): void {
    if (history && !isSSR) history.go(delta);
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
   * Sets a new location and refreshes the current route.
   * 
   * Useful in SSR context to initialize the router with the server request URL.
   * 
   * @param request - The server request containing the new URL and user agent.
   */
  async function setRequest(request: NodeRequest): Promise<void> {
    const normalizedRequest = normalizeServerRequest(request);
    _location = getLocation(normalizedRequest.url.href, normalizedRequest.userAgent);
    _request = normalizedRequest;
    await initialSetup();
  }

  /**
   * Gets a router link with the specified options.
   * 
   * @param options - The router link options.
   * @returns The created router link.
   */
  function getRouterLink({ path, params = {}, searchParams, hash }: RouterLinkOptions): RouterLink {
    path = Object.entries(params || {}).reduce((acc, [prop, value]) => {
      return acc.replace(new RegExp(`((\\()?|(\\(\\/))?\:${prop}(\\)?\\?)?`), `${value}`);
    }, path);

    path = path.replace(/\/?((\()?|(\(\/))?\:[^\/]+(\)?\?)?.*/, '');

    const search = searchParams ? `${path.split('?')[0]}?${searchParams.toString()}` : '';
    path = `${path}${search}${hash ? `#${hash}` : ''}`;

    const isActiveRE = pathToRegExp(path, { end: false, sensitive });
    const isExactActiveRE = pathToRegExp(path, { end: true, sensitive });

    const { pathname } = _location;

    return {
      pathname: path,
      isActive: isActiveRE.test(pathname),
      isExactActive: isExactActiveRE.test(pathname),
      navigate: (to?: string) => navigate(to || path),
    };
  }

  /**
   * Modify <html>, <head>, and <body> tag attributes.
   * Can be called from inside your page component.
   */
  function setDocument(settings: DocumentSettings): void {
    if (!settings || typeof settings !== 'object') return;

    if (settings.htmlAttrs) {
      router.documentSettings.htmlAttrs = settings.htmlAttrs;
    }
    if (settings.head) {
      router.documentSettings.head = settings.head;
    }
    if (settings.bodyAttrs) {
      router.documentSettings.bodyAttrs = settings.bodyAttrs;
    }

    if(isSSR) return; // No need to manipulate actual document in SSR context
    
    if (settings.htmlAttrs) {
      Object.entries(settings.htmlAttrs).forEach(([k, v]) => {
        document.documentElement.setAttribute(k, v);
      });
    }
    
    if (settings.head) {
      Object.entries(settings.head).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          v.forEach(attrs => {
            const el = document.createElement(k);
            Object.entries(attrs).forEach(([ak, av]) => el.setAttribute(ak, av));
            document.head.appendChild(el);
          });
        } else {
          const el = document.createElement(k);
          Object.entries(v).forEach(([ak, av]) => el.setAttribute(ak, av));
          document.head.appendChild(el);
        }
      });
    }
    
    if (settings.bodyAttrs) {
      Object.entries(settings.bodyAttrs).forEach(([k, v]) => {
        document.body.setAttribute(k, v);
      });
    }
  }

  return router;
}
