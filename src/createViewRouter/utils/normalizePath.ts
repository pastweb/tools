import type { Route } from '../types';

/**
 * Normalizes a route's path (and its children's paths) relative to a base and parent path.
 *
 * Ensures consistent leading/trailing slashes, handles redirects, and recursively normalizes children.
 * Used during initial route setup.
 *
 * @param base - The router's base path (e.g. "/app")
 * @param route - The route definition to normalize
 * @param parent - The accumulated parent path for nested routes (internal use)
 * @returns A new Route object with normalized path(s)
 */
export function normalizePath(base: string, route: Route, parent: string = ''): Route {
  let { path, redirect, children, ...rest } = route;

  path = path.replace(/\/+/g, '/').trim();
  redirect = redirect ? redirect.replace(/\/+/g, '/').trim() : redirect;

  const joinPaths = (...parts: string[]) => {
    const normalized = parts
      .filter(Boolean)
      .join('/')
      .replace(/\/+/g, '/')
      .replace(/\/$/, '');

    return normalized.startsWith('/') ? normalized || '/' : `/${normalized}`;
  };

  if (!parent) {
    path = joinPaths(base, path);
    
    if (redirect) redirect = joinPaths(base, redirect);
  } else {
    const isAbsolute = path.startsWith('/');
    path = isAbsolute ? joinPaths(base, path) : joinPaths(parent, path);
    
    if (redirect) {
      const isRedirectAbsolute = redirect.startsWith('/');
      redirect = isRedirectAbsolute ? joinPaths(base, redirect) : joinPaths(parent, redirect);
    }
  }

  return {
    path,
    ...redirect ? { redirect } : {},
    ...children && { children: [...children.map(child => normalizePath(base, child, path))] },
    ...rest
  };
}
