import { ROUTER_CONTEXT_KEY } from '../constants';
import { getContextUtils } from '../../globalContext';
import type { ViewRouter } from '../types';

/**
 * Returns the current `ViewRouter` instance from the mediator context.
 *
 * This hook is intended to be called from within a mediator function (see `createMediatorContextUtils`
 * and `getContextUtils` from `@pastweb/tools/globalContext`). It retrieves the `ViewRouter` that was
 * previously registered in the context under `ROUTER_CONTEXT_KEY`.
 *
 * The hook must be called inside a properly set up mediator context (i.e., the router must have been
 * provided via `setContext(ROUTER_CONTEXT_KEY, router)` before the mediator executes). It throws a
 * descriptive error otherwise.
 *
 * @returns The active `ViewRouter` instance.
 *
 * @example
 * Using inside a mediator:
 * ```ts
 * import { useRouter, reactive, effect } from '@pastweb/tools';
 *
 * export function myMediator(props: any, extras: any) {
 *   const r = useRouter();
 *
 *   const state = reactive({
 *     currentPath: '',
 *   });
 *
 *   effect(() => {
 *     state.currentPath = r.currentRoute.path;
 *   });
 *
 *   return { state };
 * }
 * ```
 */
export function useRouter(): ViewRouter {
  const { getContext } = getContextUtils();
  const router = getContext<ViewRouter>(ROUTER_CONTEXT_KEY);
  
  if (!router) {
    throw new Error('useRouter must be called within a ViewRouter context.\nMake sure the ViewRouter is properly set up in the Global Context.');
  }
  
  return router;
}
