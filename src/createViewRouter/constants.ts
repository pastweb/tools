export const EMPTY_ROUTE = {
  parent: false,
  regexp: new RegExp(''),
  path: '',
  params: {},
  searchParams: new URLSearchParams(),
  setSearchParams: (...args: any[]) => {},
  hash: '',
  setHash: (...args: any[]) => {},
  views: {},
  options: {},
  child: false,
};
