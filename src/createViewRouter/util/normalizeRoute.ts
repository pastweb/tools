import type { Route } from '../types';

export function normalizeRoute(RouterView: any, route: Route, fullParent: string = ''): Route {
  const { path: _path, redirect, view, views: _views = {}, children, ...rest } = route;
  // Compute relative path using full parent
  let relativePath = fullParent
    ? route.path.replace(fullParent, '').replace(/^\//, '')
    : route.path;

  if (redirect) {
    return { path: relativePath, redirect: `/${redirect.replace(/^\//, '')}`, ...rest };
  }

  const views = { default: view || RouterView, ..._views };

  if (route.children) {
    // Compute full path for this level (for recursing to children)
    const fullPathForThis = fullParent ? `${fullParent}/${relativePath}` : route.path;

    // Recurse with full path as new parent
    const childrenNormalized = route.children.map(child =>
      normalizeRoute(RouterView, child, fullPathForThis)
    );

    return { path: relativePath, views, children: childrenNormalized, ...rest };
  }

  return { path: relativePath, views, ...rest };
}
