import type { IncomingMessage } from 'node:http';
import type { RemoveListener } from '../createEventEmitter';
import type { BrowserHistory, HashHistory, MemoryHistory } from 'history';

export type View = any | (() => Promise<{ default: any, [prop: string]: any }>);

export interface Route {
  path: string;
  redirect?: string;
  view?: View;
  views?: Record<string, View>;
  children?: Route[];
  [optionName: string]: any;
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

export interface RouteOptions {
  redirect?: string;
  params?: Record<string, any>;
  [optionName: string]: any;
};

export interface ParsedRoute {
  path: string;
  regexp: RegExp;
  views: Record<string, View>;
  options: RouteOptions;
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
  options: RouteOptions;
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
export type NodeRequest = IncomingMessage;

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
};

/**
 * Render function signature used by page-router
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

export interface ViewRouter {
  back: () => void;
  currentRoute: SelectedRoute;
  forward: () => void;
  location: Location;
  preloader: any;
  paths: Route[];
  isResolving: boolean;
  setBase: (base: string) => void;
  addRoute: (route: Route) => Promise<void>;
  getRoute: (path: string) => Promise<SelectedRoute | false>;
  onRouteChange: (fn: (route: SelectedRoute) => void) => RemoveListener;
  onRouteAdded: (fn: (routes: Route[]) => void) => RemoveListener;
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
};

