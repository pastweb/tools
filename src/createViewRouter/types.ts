import type { IncomingMessage } from 'node:http';
import type { BrowserHistory, HashHistory, MemoryHistory } from 'history';

export type NodeRequest = IncomingMessage;

export type View = any | (() => Promise<{ default: any, [prop: string]: any }>);

export interface Route {
  path: string;
  redirect?: string;
  hideInPaths?: boolean;
  view?: View;
  views?: Record<string, View>;
  children?: Route[];
  meta?: Record<string, any>;
};

export type FilterFunction = (value: any) => boolean;
export type FilterDescriptor = Record<string, any | FilterFunction>;

export type RouteParamValue = string | number | boolean | null | undefined;
export type RouteParams = Record<string, RouteParamValue | RouteParamValue[]>;

export interface Location {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  origin: string;
  pathname: string;
  port: number;
  protocol: string;
  searchParams: URLSearchParams;
  userAgent: string;
};

export interface RouterOptions {
  base?: string;
  debug?: boolean;
  history?: BrowserHistory | HashHistory | MemoryHistory;
  RouterView?: any;
  preloader?: any;
  beforeRouteParse?: (route: Route) => Route | void | Promise<Route | void>;
  beforeRouteSelect?: (route: SelectedRoute) => SelectedRoute | void | Promise<SelectedRoute | void>;
  routes: Route[];
  sensitive?: boolean;
  encode?: (str: string) => string;

  /**
   * Optional initial server request (Node IncomingMessage or compatible).
   *
   * When provided **in an SSR environment** (`typeof window === 'undefined'`),
   * `createViewRouter` will automatically call `setRequest` during construction.
   * This ensures that after `await router.ready`, `currentRoute` and `location`
   * are already resolved to the correct values.
   *
   * @example
   * ```ts
   * // Server (Node)
   * const router = createViewRouter({
   *   routes,
   *   initialRequest: req, // from http.IncomingMessage
   * });
   * await router.ready;
   * console.log(router.currentRoute.path);
   * ```
   */
  initialRequest?: NodeRequest;
};

export interface RouterNormalizedOptions {
  base: string;
  debug: boolean;
  history?: BrowserHistory | HashHistory | MemoryHistory;
  RouterView: any;
  preloader?: any;
  beforeRouteParse?: (route: Route) => Route | void | Promise<Route | void>;
  beforeRouteSelect?: (route: SelectedRoute) => SelectedRoute | void | Promise<SelectedRoute | void>;
  routes: Route[];
  sensitive: boolean;
};

export interface RouteMetadata {
  redirect?: string;
  [optionName: string]: any;
};

export interface ParsedRoute {
  path: string;
  regexp: RegExp;
  views: Record<string, View>;
  meta: RouteMetadata;
  children: ParsedRoute[];
};

export interface SelectedRoute {
  parent: SelectedRoute | boolean;
  regexp: RegExp;
  path: string;
  params: RouteParams;
  searchParams: URLSearchParams;
  setSearchParams: (params: URLSearchParams) => void;
  hash: string;
  setHash: (hash?: string) => void;
  views: Record<string, View>;
  meta: RouteMetadata;
  child: SelectedRoute | boolean;
};

export interface RouterLinkOptions {
  path: string;
  params?: Record<string, string | number | boolean | null | undefined>;
  searchParams?: URLSearchParams;
  hash?: string;
};

export interface RouterLink {
  pathname: string;
  isActive: boolean;
  isExactActive: boolean;
  navigate: (to?: string) => void;
};

/*
 * Server-side types
 */

/**
 * Base SSR Request - Cross-runtime friendly
 */
export interface ServerRequest {
  /** Original native request from the underlying server */
  originalRequest: NodeRequest;
  /** IP address (commonly added by proxies/load balancers) */
  ip: string;
  /** User-Agent (convenience) */
  userAgent: string;
  /** Raw cookies string */
  cookies: string;
  /** Normalized URL (absolute) */
  url: URL;
  /** HTTP method */
  method: string;
  /** Request headers */
  headers: Headers;

  /**
   * Best-guess primary language from the `Accept-Language` header.
   * Examples: "en-US", "fr", "de-DE"
   */
  language: string;

  /**
   * Detected operating system (with version when available) from the User-Agent string.
   * Examples: "macOS 10.15.7", "Windows 10", "iOS 17.2", "Android 14", "Linux", "Unknown"
   */
  os: string;

  /**
   * User's preferred color scheme, derived from modern client hints (`Sec-CH-Prefers-Color-Scheme`)
   * or common cookie patterns (e.g. `prefers-color-scheme=dark`).
   */
  colorScheme: 'light' | 'dark' | 'no-preference';
};

/**
 * Render function signature used by SSR router
 */
export type RenderFunction = (request: ServerRequest) => Promise<string>;

/**
 * Document settings for SSR rendering, allowing customization of HTML attributes and head elements.
 * - `htmlAttrs`: Attributes to add to the `<html>` tag.
 * - `head`: Elements to add to the `<head>`, where keys are tag names (e.g. "meta", "link") and values are either a single attributes object or an array of attributes objects for multiple tags.
 * - `bodyAttrs`: Attributes to add to the `<body>` tag.
 */
export interface DocumentSettings {
  htmlAttrs?: Record<string, string>;
  head?: Record<string, Record<string, string> | Record<string, string>[]>;
  bodyAttrs?: Record<string, string>;
};

export interface RouterState {
  location: Location;
  currentRoute: SelectedRoute;
  paths: Route[];
  isResolving: boolean;
  base: string;
};

export interface ViewRouter {
  back: () => void;
  currentRoute: SelectedRoute;
  forward: () => void;
  location: Location;
  preloader: any;
  paths: Route[];
  isResolving: boolean;
  base: string;
  setBase: (base: string) => void;
  addRoute: (route: Route) => Promise<void>;
  getRoute: (path: string) => Promise<SelectedRoute | false>;
  navigate: (path: string, state?: any) => Promise<void>;
  push: (path: string, state?: any) => Promise<void>;
  replace: (path: string, state?: any) => void;
  go: (delta: number) => void;
  setSearchParams: (searchParams: URLSearchParams) => void;
  setHash: (hash?: string) => void;
  getRouterLink: (linkOptions: RouterLinkOptions) => RouterLink;
  setRequest: (request: NodeRequest) => Promise<void>; // SSR-only method to update location and re-run route matching (useful for server-side rendering)
  request: ServerRequest; // Expose the current server request (SSR-only)
  setDocument: (settings: DocumentSettings) => void;
  documentSettings: DocumentSettings;
  initialSetup: () => Promise<void>; // Method to perform initial setup, including processing the initial route and setting up history listeners (useful for SSR to ensure correct initial render and tests)

  /**
   * A promise that resolves once the router has performed its initial route resolution.
   *
   * - In the browser: resolves after the automatic initialization from `window.location`.
   * - With `initialRequest`: resolves after automatic SSR initialization.
   * - Otherwise (plain SSR): resolves immediately. You must call `setRequest` or `initialSetup` yourself.
   *
   * Use `await router.ready` before reading `currentRoute` / `location` if you need
   * a guaranteed correct initial value (avoids the transient `EMPTY_ROUTE`).
   *
   * @example
   * ```ts
   * const router = createViewRouter({ routes });
   * await router.ready;
   * console.log(router.currentRoute.path); // safe to read
   * ```
   */
  ready: Promise<void>;
};
