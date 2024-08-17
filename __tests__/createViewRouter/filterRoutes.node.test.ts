import { filterRoutes, Route, FilterDescriptor } from '../../src/createViewRouter';

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

  it('should filter routes based on a simple property match', () => {
    const filter: FilterDescriptor = { component: 'HomeComponent' };
    const [ route ] = filterRoutes(routes, filter);
    
    expect(route.path).toBe('/home');
    expect(route.component).toBe('HomeComponent');
  });

  it('should filter out routes with redirect property', () => {
    const result = filterRoutes(routes);
    expect(result.filter(({ path }) => path === '/admin').length).toBe(0);
  });

  it('should filter out routes with hideInPaths property', () => {
    const filter: FilterDescriptor = { component: 'AboutComponent' };
    const result = filterRoutes(routes, filter);
    expect(result.filter(({ path }) => path === '/about').length).toBe(0);
  });

  it('should apply filters to child routes', () => {
    const filter: FilterDescriptor = { component: 'ForgotPasswordComponent' };
    const result = filterRoutes(routes, filter);

    expect(result).toEqual([{ path: '/login', component: 'LoginComponent', children: [
      { path: '/login/forgot', component: 'ForgotPasswordComponent' },
    ] }]);
  });

  it('should handle function-based filters', () => {
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
