import { computed } from '../../reactivity';
import { useRouter } from '../useRouter';

/**
 * Returns a reactive object with the current search params and a setter.
 *
 * This hook must be called from inside a mediator function (see `createMediatorContextUtils` and
 * `getContextUtils` from `@pastweb/tools/globalContext`). It internally calls `useRouter` to obtain
 * the active router.
 *
 * `params` is powered by a `computed` over `router.location.searchParams` (object-shaped computed
 * yields a transparent proxy). Accesses to `search.params.get(...)`, `search.params.toString()` etc.
 * are tracked and stay up-to-date on location changes.
 *
 * The `setSearchParams` is delegated directly from the router.
 *
 * This makes it safe to capture the result from a mediator and use/observe `params` in effects
 * or other computed without stale data. Uses the new computed object proxy support (direct access,
 * no manual sync effect or reactive container for the data part).
 *
 * @returns A reactive object `{ params: URLSearchParams; setSearchParams: (searchParams: URLSearchParams) => void }`.
 *
 * @example
 * ```ts
 * import { useSearchParams, reactive, effect } from '@pastweb/tools';
 *
 * export function myMediator(props: any, extras: any) {
 *   const search = useSearchParams();
 *
 *   const state = reactive({
 *     filter: '',
 *   });
 *
 *   effect(() => {
 *     state.filter = search.params.get('filter') || '';
 *   });
 *
 *   function setFilter(value: string) {
 *     const next = new URLSearchParams(search.params);
 *     next.set('filter', value);
 *     search.setSearchParams(next);
 *   }
 *
 *   return { state, setFilter };
 * }
 * ```
 */
export function useSearchParams(): {
  params: URLSearchParams;
  setSearchParams: (searchParams: URLSearchParams) => void;
} {
  const router = useRouter();

  // Derived params via computed (for object result: stable proxy with direct access + tracking).
  // We return a plain container object (with getter) so the public shape { params, setSearchParams }
  // is preserved, while the params value itself benefits from transparent computed proxy.
  const params = computed(() => router.location.searchParams);

  return {
    get params() {
      // Touch the computed proxy (via .value) so that:
      // - the computed is ensured fresh
      // - a track() happens on the proxy (registering deps on the active effect)
      // This links observation of search.params (in effects etc.) to the underlying location changes.
      // We return the *raw* URLSearchParams (not the proxy) for correct instanceof, method 'this', etc.
      void (params as any).value;
      return (params as any).value as URLSearchParams;
    },
    setSearchParams: router.setSearchParams,
  };
}
