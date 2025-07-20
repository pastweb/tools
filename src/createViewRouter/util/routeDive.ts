import type { SelectedRoute } from '../types';

/**
 * Traverses the nested route structure up to a specified depth and returns the selected route.
 *
 * @param route - The initial `SelectedRoute` object to start traversing from.
 * @param depth - The number of levels to traverse into the nested route structure.
 * @returns The `SelectedRoute` object at the specified depth. If the depth is greater than the nesting level,
 *          it returns the deepest child route available.
 */
export function routeDive(route: SelectedRoute, depth: number): SelectedRoute {
  if (!depth) return route;

  for(let i = 0; i <= depth - 1; i++) {
    if (route.child) {
      route = route.child as SelectedRoute;
    }
  }

  return route;
}
