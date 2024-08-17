import { Route } from '../types';

export function normalizeRoute(
  RouterView: any,
  route: Route ,
  parent: string = ''
): Route {
  const { path: _path, redirect, view, views: _views = {}, children, ...rest } = route;
  let path = parent ? route.path.replace(parent, '').replace(/^\//, '') : route.path;
  path = path.replace(/\/\*/g, '(.*)');

  if (redirect) {
    return { path, redirect: `/${redirect.replace(/^\//, '')}`, ...rest };
  }

  const views = { default: view || RouterView, ..._views };

  if (route.children) {
    const children = route.children.map(child => normalizeRoute(RouterView, child, path));

    return { path, views, children, ...rest };
  }
  
  return { path, views, ...rest };
}
