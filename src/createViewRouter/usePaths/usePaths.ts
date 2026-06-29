import { computed } from '../../reactivity';
import { useRouter } from '../useRouter';
import { filterRoutes } from '../utils';
import type { Route, FilterDescriptor } from '../types';

/**
 * Hook that returns the (optionally filtered) list of routes currently known to the router
 * as a reactive readonly array (a transparent proxy powered by `computed`).
 *
 * This hook must be called from inside a mediator function (see `createMediatorContextUtils` and
 * `getContextUtils` from `@pastweb/tools/globalContext`). It internally calls `useRouter` to obtain
 * the active router.
 *
 * - `filter` has the same shape as the argument to the standalone `filterRoutes` utility.
 * - The returned array is powered by `computed`, so it is automatically and efficiently recomputed
 *   whenever `router.paths` changes (e.g. after `addRoute`) or when a new filter is passed.
 * - You use the result directly as an array (`paths.length`, `paths.map(...)`, `paths.some(...)` etc.).
 *   All accesses are tracked.
 * - This makes it safe to do `const paths = usePaths(myFilter); effect(() => { ... paths ... })`
 *   from inside a mediator without capturing stale route lists. The returned value can also be
 *   used directly as a source to `effect` or inside other `computed` calls.
 *
 * @param filter - Optional `FilterDescriptor` used to filter the routes (default: `{}` = return all).
 * @returns A reactive readonly array of routes (`Readonly<Route[]>` — transparent proxy from `computed`).
 *
 * @example
 * ```ts
 * import { usePaths, useRouter, reactive, effect } from '@pastweb/tools';
 *
 * export function myMediator(props: any, extras: any) {
 *   const router = useRouter();
 *   const paths = usePaths({ meta: { visibleInMenu: true } });
 *
 *   const state = reactive({
 *     menuItems: [] as any[],
 *   });
 *
 *   effect(() => {
 *     state.menuItems = paths;
 *   });
 *
 *   return { state };
 * }
 * ```
 */
export function usePaths(filter: FilterDescriptor = {}): Readonly<Route[]> {
  const router = useRouter();

  // For arrays (objects), computed returns a transparent readonly proxy directly.
  // This gives a clean direct-array API consistent with router.paths and the
  // updated mediator hooks (useLocation, useRoute, etc.).
  return computed<Route[]>(() => filterRoutes(router.paths, filter));
}

