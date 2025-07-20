import type { Route, FilterDescriptor, FilterFunction } from '../types';

/**
 * Filters a list of routes based on the provided filter descriptor.
 *
 * @param {Route[]} routes - The list of routes to be filtered.
 * @param {FilterDescriptor} filter - The filter descriptor to apply. The keys are property names and the values are the criteria to match.
 * @returns {Route[]} - The filtered list of routes.
 *
 * @example
 * const routes = [
 *   { path: '/home', component: HomeComponent },
 *   { path: '/about', component: AboutComponent, hideInPaths: true },
 *   { path: '/user/:id', component: UserComponent },
 * ];
 *
 * const filter = { component: HomeComponent };
 *
 * const filteredRoutes = filterRoutes(routes, filter);
 * console.log(filteredRoutes); // Outputs: [{ path: '/home', component: HomeComponent }]
 */
export function filterRoutes(routes: Route[] = [], filter: FilterDescriptor = {}): Route[] {
  const filters = Object.entries(filter);

  return routes.reduce((acc, r) => {
    if (r.redirect || r.hideInPaths || /^:/.test(r.path)) return acc;

    if (r.children) {
      const children = filterRoutes(r.children, filter);
      
      if (!children.length) return acc;
      
      return [ ...acc, { ...r, children } ];
    }

    for(const [ prop, value ] of filters) {
      if (!r[prop]) return acc;
      if (typeof value === 'function') {
        if (!(value as FilterFunction)(r[prop])) return acc;
      } else if (r[prop] !== value) {
        return acc;
      }
    }

    return [ ...acc, r ];
  }, [] as Route[]);
}
