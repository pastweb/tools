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

  if (!parent) {
    path = `${base}${path.replace(/(^\/)|(\/$)/g, '')}`;
    
    if (redirect) redirect = `${base}${redirect.replace(/(^\/)|(\/$)/g, '')}`;
  } else {
    path = path.replace(parent, '').replace(/\/$/, '');
    path = `${/^\//.test(path) ? parent : ''}${path}`;
    
    if (redirect) {
      redirect = redirect.replace(parent, '').replace(/\/$/, '');
      redirect = `${/^\//.test(redirect) ? parent : ''}${redirect}`;
    }
  }

  return {
    path,
    ...redirect ? { redirect } : {},
    ...children && { children: [...children.map(child => normalizePath(base, child, path))] },
    ...rest
  };
}
