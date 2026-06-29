import type { Route } from '../types';

/**
 * Normalizes a route definition for internal use.
 *
 * - Computes relative paths
 * - Injects default RouterView for views
 * - Recursively normalizes children
 * - Handles redirects
 *
 * Called during route parsing in createViewRouter.
 *
 * @param RouterView - The default RouterView component to use when no view is specified
 * @param route - The raw route definition
 * @param fullParent - Internal: the full parent path for recursion
 * @returns A normalized Route object ready for matching
 */
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
