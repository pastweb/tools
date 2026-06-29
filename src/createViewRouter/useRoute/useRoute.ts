import { computed } from '../../reactivity';
import { useRouter } from '../useRouter';
import type { SelectedRoute } from '../types';

/**
 * Returns a reactive `SelectedRoute` object (transparent readonly proxy powered by `computed`)
 * that remains in sync with the router's current route.
 *
 * This hook is intended to be called from within a mediator function (see `createMediatorContextUtils`
 * and `getContextUtils` from `@pastweb/tools/globalContext`). It relies on `useRouter` to retrieve
 * the `ViewRouter` instance from the current mediator context.
 *
 * The returned value is a stable computed proxy over `router.currentRoute`. All property accesses
 * (e.g. `route.path`, `route.params`, `route.meta`) and method calls are tracked and automatically
 * reflect the latest matched route. This works even when captured from a mediator:
 *
 * ```ts
 * const route = useRoute();
 * effect(() => {
 *   console.log('Current path:', route.path);
 * });
 * ```
 *
 * Uses the object-shaped `computed` support for direct access (no `.value` wrapper) while
 * providing full reactivity and ref compatibility.
 *
 * @returns A reactive `SelectedRoute` proxy whose properties stay in sync with the router.
 *
 * @example
 * Using inside a mediator with reactivity:
 * ```ts
 * import { useRoute, reactive, effect } from '@pastweb/tools';
 *
 * export function myMediator(props: any, extras: any) {
 *   const route = useRoute();   // reactive proxy (computed)
 *
 *   const state = reactive({
 *     currentPath: '',
 *     title: '',
 *   });
 *
 *   effect(() => {
 *     // This will re-run whenever the current route changes
 *     state.currentPath = route.path;
 *     state.title = route.meta?.title || route.path;
 *   });
 *
 *   return { state };
 * }
 * ```
 */
export function useRoute(): SelectedRoute {
  const router = useRouter();

  // Direct computed over the router's currentRoute gives a stable proxy for the
  // object result. Property reads and method access are forwarded with tracking.
  // No manual copying or special rebinding needed; the proxy always sees the live value.
  return computed(() => router.currentRoute) as unknown as SelectedRoute;
}
