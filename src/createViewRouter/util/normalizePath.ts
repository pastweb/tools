import { Route } from '../types';

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
