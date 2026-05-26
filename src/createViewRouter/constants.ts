import { noop } from '../noop';

export const EMPTY_ROUTE = {
  parent: false,
  regexp: new RegExp(''),
  path: '',
  params: {},
  searchParams: new URLSearchParams(),
  setSearchParams: noop,
  hash: '',
  setHash: noop,
  views: {},
  options: {},
  child: false,
};

export const ROUTER_CONTEXT_KEY = '$$router';
export const ROUTE_DEPTH_CONTEXT_KEY = '$$routeDepth';
