export const EMPTY_ROUTE = {
  parent: false,
  regex: new RegExp(''),
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
