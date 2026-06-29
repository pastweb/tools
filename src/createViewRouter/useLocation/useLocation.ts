import { computed } from '../../reactivity';
import { useRouter } from '../useRouter';
import type { Location } from '../types';

/**
 * Returns a reactive `Location` object (transparent readonly proxy powered by `computed`)
 * that remains in sync with the router's current location.
 *
 * This hook is intended to be called from within a mediator function (see `createMediatorContextUtils`
 * and `getContextUtils` from `@pastweb/tools/globalContext`). It relies on `useRouter` to retrieve
 * the `ViewRouter` instance from the current mediator context.
 *
 * The returned value is a stable computed proxy over `router.location`. All property accesses
 * (e.g. `location.pathname`, `location.search`) are tracked and automatically reflect the latest
 * router location. This works even when the hook result is captured from inside a mediator:
 *
 * ```ts
 * const location = useLocation();
 * effect(() => {
 *   console.log('Current path:', location.pathname);
 * });
 * ```
 *
 * Because it uses the object-shaped `computed` behavior, you get direct property access without
 * a `.value` wrapper, while retaining full reactivity and ref-like compatibility (usable as
 * effect source, `isRef(location)` etc.).
 *
 * @returns A reactive `Location` proxy whose properties stay in sync with the router.
 *
 * @example
 * Using inside a mediator with reactivity:
 * ```ts
 * import { useLocation, reactive, effect } from '@pastweb/tools';
 *
 * export function myMediator(props: any, extras: any) {
 *   const location = useLocation();
 *
 *   const state = reactive({
 *     currentPath: '',
 *   });
 *
 *   effect(() => {
 *     // This will re-run whenever location changes
 *     state.currentPath = location.pathname;
 *   });
 *
 *   return { state };
 * }
 * ```
 */
export function useLocation(): Location {
  const router = useRouter();

  // Use computed directly for the location object.
  // For object results this returns a transparent readonly proxy with direct
  // property access + automatic dependency tracking on the underlying router.location.
  // The proxy is stable, perfect for capture in mediators + effects on specific props.
  return computed(() => router.location) as unknown as Location;
}
