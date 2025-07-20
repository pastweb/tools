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
export type RouteParams = Record<string, RouteParamValue>;

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
};

export interface RouterOptions {
  base?: string;
  debug?: boolean;
  history?: BrowserHistory | HashHistory | MemoryHistory;
  RouterView: any;
  preloader?: any;
  beforeRouteParse?: (route: Route) => Route;
  beforeRouteSelect?: (route: SelectedRoute) => SelectedRoute;
  routes: Route[];
  href?: string;
  sensitive?: boolean;
  encode?: (str: string) => string;
};

export interface RouterNormalizedOptions {
  base: string;
  debug: boolean;
  history: BrowserHistory | HashHistory | MemoryHistory;
  RouterView: any;
  preloader?: any;
  beforeRouteParse?: (route: Route) => Route;
  beforeRouteSelect?: (route: SelectedRoute) => SelectedRoute;
  routes: Route[];
  href: string;
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

export interface ViewRouter {
  back: () => void;
  currentRoute: SelectedRoute;
  forward: () => void;
  location: Location;
  preloader: any;
  paths: Route[];
  setBase: (base: string) => void;
  addRoute: (route: Route) => void;
  onRouteChange: (fn: (route: SelectedRoute) => void) => RemoveListener;
  onRouteAdded: (fn: (routes: Route[]) => void) => RemoveListener;
  navigate: (path: string, state?: any) => void;
  push: (path: string, state?: any) => void;
  replace: (path: string, state?: any) => void;
  go: (delta: number) => void;
  setSearchParams: (searchParams: URLSearchParams) => void;
  setHash: (hash?: string) => void;
  getRouterLink: (linkOptions: RouterLinkOptions) => RouterLink;
};

