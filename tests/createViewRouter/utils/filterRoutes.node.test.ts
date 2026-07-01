import { describe, it, expect } from 'vitest';
import { filterRoutes, Route, FilterDescriptor } from '../../../src/createViewRouter';

describe('filterRoutes', () => {
  const routes: Route[] = [
    { path: '/home', component: 'HomeComponent' },
    { path: '/about', component: 'AboutComponent', hideInPaths: true },
    { path: '/user/:id', component: 'UserComponent' },
    { path: '/admin', component: 'AdminComponent', redirect: '/login' },
    { path: '/login', component: 'LoginComponent', children: [
      { path: '/login/forgot', component: 'ForgotPasswordComponent' },
    ]}
  ];

  it('given a list of routes and a simple property filter, when filterRoutes is called, then only routes where the property matches the predicate are kept', () => {
    const filter: FilterDescriptor = { component: 'HomeComponent' };
    const [ route ] = filterRoutes(routes, filter);
    
    expect(route.path).toBe('/home');
    expect(route.component).toBe('HomeComponent');
  });

  it('given routes some of which have a redirect, when a filter for !redirect is applied, then redirect routes are excluded', () => {
    const result = filterRoutes(routes);
    expect(result.filter(({ path }) => path === '/admin').length).toBe(0);
  });

  it('given routes with hideInPaths, when the default or explicit filter is applied, then those routes are removed from the result', () => {
    const filter: FilterDescriptor = { component: 'AboutComponent' };
    const result = filterRoutes(routes, filter);
    expect(result.filter(({ path }) => path === '/about').length).toBe(0);
  });

  it('given nested child routes, when filterRoutes runs, then filters are applied recursively to children as well', () => {
    const filter: FilterDescriptor = { component: 'ForgotPasswordComponent' };
    const result = filterRoutes(routes, filter);

    expect(result).toEqual([{ path: '/login', component: 'LoginComponent', children: [
      { path: '/login/forgot', component: 'ForgotPasswordComponent' },
    ] }]);
  });

  it('given a filter that is a function, when filterRoutes is called, then the function is used to decide inclusion for each route', () => {
    const filter: FilterDescriptor = { component: (comp: string) => comp.includes('Component') };
    const result = filterRoutes(routes, filter);

    expect(result).toEqual([
      { path: '/home', component: 'HomeComponent' },
      { path: '/user/:id', component: 'UserComponent' },
      { path: '/login', component: 'LoginComponent', children: [
        { path: '/login/forgot', component: 'ForgotPasswordComponent' },
      ] }
    ]);
  });
});
