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
  meta: {},
  child: false,
};

export const ROUTER_CONTEXT_KEY = '$$ROUTER_CONTEXT_KEY';
export const ROUTE_DEPTH_CONTEXT_KEY = '$$ROUTE_DEPTH_CONTEXT_KEY';
