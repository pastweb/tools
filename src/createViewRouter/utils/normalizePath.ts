import type { Route } from '../types';

/**
 * Normalizes a route's path (and its children's paths) relative to a base and parent path.
 *
 * Ensures consistent leading/trailing slashes, handles redirects, and recursively
 * normalizes children. Used during initial route setup.
 *
 * Top-level routes are joined with `base`. Child routes drop a leading `/` and
 * are joined with the parent path, so `files` and `/files` under `/docs` both
 * become `/docs/files`. Child redirects that start with `/` stay absolute from
 * `base`.
 *
 * @param base - The router's base path (e.g. "/app")
 * @param route - The route definition to normalize
 * @param parent - The accumulated parent path for nested routes (internal use)
 * @returns A new Route object with normalized path(s)
 *
 * @example
 * ```ts
 * import { normalizePath } from '@pastweb/tools/createViewRouter/utils/normalizePath';
 *
 * const route = normalizePath('/', {
 *   path: '/docs',
 *   children: [
 *     { path: 'files' },
 *     { path: '/routing' },
 *   ],
 * });
 *
 * route.path; // '/docs'
 * route.children[0].path; // '/docs/files'
 * route.children[1].path; // '/docs/routing'
 * ```
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
    path = joinPaths(parent, path.replace(/^\//, ''));

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
