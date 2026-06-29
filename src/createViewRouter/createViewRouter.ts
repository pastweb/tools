import { reactive } from '../reactivity';
import { isObject } from '../isObject';
import { noop } from '../noop';
import { isBrowser } from '../envs';
import {
  normalizeOptions,
  getLocation,
  normalizePath,
  normalizeRoute,
  pathMatch,
  pathToRegExp,
  normalizeServerRequest,
} from './utils';
import { EMPTY_ROUTE } from './constants';
import type {
  ViewRouter,
  RouterState,
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
 * The returned router exposes reactive state properties (`currentRoute`, `location`,
 * `isResolving`, `paths`, `base`, etc.). Use the library's reactivity primitives
 * (e.g. `effect`, `computed`) to react to changes.
 *
 * In SSR environments, provide `initialRequest` (or call `await router.setRequest(req)`
 * / `await router.initialSetup()`) and `await router.ready` to ensure `currentRoute`
 * is correctly populated before use.
 *
 * @param options - The router options.
 * @returns The created view router.
 *
 * @example
 * ```ts
 * import { createViewRouter, effect } from '@pastweb/tools';
 *
 * const router = createViewRouter({
 *   routes: [
 *     { path: '/', view: 'Home' },
 *     { path: '/about', view: 'About' },
 *   ],
 * });
 *
 * // React to route changes (works in both browser and SSR after ready)
 * effect(() => {
 *   console.log('Current route:', router.currentRoute.path);
 * });
 *
 * // Browser usage
 * await router.ready; // optional but recommended for initial route
 *
 * // SSR usage with initial request
 * // const router = createViewRouter({ routes, initialRequest: req });
 * // await router.ready;
 * ```
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

  // Support automatic SSR initialization if an initial server request is provided.
  // This allows consumers to get a router where currentRoute is already correct
  // after `await router.ready` — without ever observing the transient EMPTY_ROUTE.
  const initialRequest = (options as RouterOptions & { initialRequest?: NodeRequest }).initialRequest;

  let _baseInit = true;
  const state = reactive<RouterState>({
    base,
    location: getLocation(isBrowser ? window.location.href : '', isBrowser ? navigator && (navigator as any).userAgent as string : ''),
    currentRoute: EMPTY_ROUTE,
    paths: routes.map(route => normalizePath(base, route)),
    isResolving: false,
  });
  
  setBase(base);
  let _parsedRoutes: ParsedRoute[] = [];
  let _request: ServerRequest = {} as ServerRequest; // Placeholder for SSR request, will be set via setRequest method

  // Ready promise so consumers can await a point where currentRoute is guaranteed to be the
  // correct matched route (avoids observing the transient EMPTY_ROUTE on first access).
  let _readyResolve: ((value?: void) => void) | undefined;
  const ready: Promise<void> = new Promise<void>(resolve => {
    _readyResolve = resolve;
  });

  // =============================================================
  // INITIAL ASYNC SETUP
  // =============================================================
  async function initialSetup() {
    _parsedRoutes = await Promise.all(state.paths.map(route => parseRoute(route)));
    const current = await getRoute();
    if (current) state.currentRoute = current;

    _readyResolve?.();
    _readyResolve = undefined;

    if (debug) {
      console.log(`[router](paths) ->`, state.paths);
      console.log(`[router](parsed routes) ->`, _parsedRoutes);
      console.log(`[router](current route) ->`, state.currentRoute);
    }
  }

  // =============================================================
  // Helper: refresh current route after navigation
  // =============================================================
  async function refreshCurrentRoute(): Promise<void> {
    state.isResolving = true;
    try {
      const newRoute = await getRoute();
      state.currentRoute = newRoute || EMPTY_ROUTE;

      // Resolve ready on the first route resolution (in addition to initialSetup)
      if (_readyResolve) {
        _readyResolve();
        _readyResolve = undefined;
      }

      if (debug) {
        console.log(`[router](current route) ->`, state.currentRoute);
      }
    } finally {
      state.isResolving = false;
    }
  }

  if (history && isBrowser) {
    history.listen(() => {
      state.location = getLocation(window.location.href, navigator && (navigator as any).userAgent as string);
      refreshCurrentRoute();
    });
  }

  const router = {
    get currentRoute() { return state.currentRoute; },
    get location() { return state.location; },
    get isResolving() { return state.isResolving; },
    get paths() { return state.paths; },
    get base() { return state.base; },
    request: _request,
    back: history ? history.back : noop,
    forward: history ? history.forward : noop,
    preloader,
    setBase,
    addRoute,
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
    documentSettings: reactive({
      htmlAttrs: {},
      head: {},
      bodyAttrs: {},
    }),
    initialSetup,
    ready,
  };

  Object.defineProperties(router, {
    currentRoute: { get() { return state.currentRoute; } },
    location: { get() { return state.location; } },
    isResolving: { get() { return state.isResolving; } },
    paths: { get() { return state.paths; } },
    base: { get() { return state.base; } },
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
    let { path, redirect, views = {}, children = [], meta: _meta = {} } = parsed;

    path = start && !path.startsWith('/') ? `/${path}` : path;
    path = path.replace(/\/+/g, '/');

    const end = !children || children.length === 0;

    const regexp = pathToRegExp(path, { start, end, sensitive });

    const meta = { ...redirect ? { redirect } : {}, ..._meta };

    return { 
      path, 
      regexp, 
      views, 
      meta, 
      children: await Promise.all(children.map(child => parseRoute(child, false))) 
    };
  }

  /**
   * Sets the base path for the router.
   * 
   * @param newBase - The new base path.
   */
  async function setBase(newBase: string = ''): Promise<void> {
    state.base = !newBase || newBase === '/' 
      ? '/' 
      : `/${newBase.replace(/(^\/)|(\/$)/g, '').replace(/\/+/g, '/')}/`;

    if (_baseInit) {
      _baseInit = false;
      return;
    }

    state.paths = state.paths.map(({ path, redirect, ...rest }) => ({
      path: `${state.base}${path.replace(state.base, state.base)}`,
      ...redirect ? { redirect: `${state.base}${redirect.replace(state.base, state.base)}` } : {},
      ...rest,
    }));

    _parsedRoutes = await Promise.all(state.paths.map(route => parseRoute(route)));

    const current = await getRoute();
    state.currentRoute = current || EMPTY_ROUTE;

    // Resolve ready on the first route resolution (in addition to initialSetup)
    if (_readyResolve) {
      _readyResolve();
      _readyResolve = undefined;
    }
  }

  /**
   * Gets the current route based on the pathname.
   * 
   * @param pathname - The pathname to match.
   * @returns The selected route or false if no match is found.
   */
  async function getRoute(pathname: string = state.location.pathname): Promise<SelectedRoute | false> {
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
    const { path, regexp, views, meta, children } = route;
    const { redirect } = meta;
    
    const mathchParams = pathMatch(path, regexp, pathname);

    if (mathchParams) {
      params = { ...params, ...mathchParams };
      const { hash, searchParams } = state.location;
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
        meta,
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
    const normalized = normalizePath(state.base, route);
    state.paths = [...state.paths, normalized];
    const parsed = await parseRoute(normalized);
    _parsedRoutes.push(parsed);
  }

  /**
   * Navigates to the specified path.
   * 
   * @param path - The path to navigate to.
   * @param state - The state to pass to the navigation.
   */
  async function navigate(path: string, state?: any): Promise<void> {
    if (history && isBrowser) history.push(path, state);
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
    if (history && isBrowser) history.replace(path, state);
    refreshCurrentRoute();
  }

  /**
   * Moves the history stack by the specified delta.
   * 
   * @param delta - The number of entries to move.
   */
  function go(delta: number): void {
    if (history && isBrowser) history.go(delta);
  }

  /**
   * Sets the search parameters for the current location.
   * 
   * @param searchParams - The search parameters to set.
   */
  function setSearchParams(searchParams: URLSearchParams): void {
    const { pathname, hash } = state.location;
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
    const { pathname, searchParams } = state.location;
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
    state.location = getLocation(normalizedRequest.url.href, normalizedRequest.userAgent);
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

    const { pathname } = state.location;

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

    if (!isBrowser) return; // No need to manipulate actual document outside the browser
    
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

  // Schedule initial route resolution.
  // - Browser: fire-and-forget using window.location (existing behavior)
  // - SSR with initialRequest: automatically resolve using the provided server request.
  //   This ensures that after `await router.ready`, currentRoute is the correct
  //   matched route from the very first (post-ready) assignment — no transient EMPTY_ROUTE.
  if (isBrowser) {
    (async () => {
      await initialSetup();
    })();
  } else if (initialRequest) {
    (async () => {
      await setRequest(initialRequest);
    })();
  } else {
    // No automatic initialization in SSR without initialRequest.
    // ready will be resolved immediately so `await router.ready` doesn't hang.
    _readyResolve?.();
    _readyResolve = undefined;
  }

  return router;
}
