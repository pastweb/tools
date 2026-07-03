import { getContextUtils } from '../../globalContext';
import { QUERY_CACHE_CONTEXT_KEY } from '../createQueryCache/constants';
import type { QueryCache } from '../createQueryCache/types';

/**
 * Returns the current `QueryCache` instance from the mediator context.
 *
 * This hook is intended to be called from within a mediator function (see `createMediatorContextUtils`
 * and `getContextUtils` from `@pastweb/tools/globalContext`). It retrieves the `QueryCache` that was
 * previously registered in the context under `QUERY_CACHE_CONTEXT_KEY`.
 *
 * The hook must be called inside a properly set up mediator context (i.e., the query cache must have been
 * provided via `setContext(QUERY_CACHE_CONTEXT_KEY, queryCache)` before the mediator executes).
 * If no cache is found, a console error is logged and `undefined` is returned.
 *
 * This is useful inside mediators to access a shared `QueryCache` (for use with `createApiAgent`, `useQuery`, etc.)
 * without having to pass it explicitly through props.
 *
 * @returns The active `QueryCache` instance, or `undefined` if not registered in the current context.
 *
 * @example
 * Using inside a mediator (with createApiAgent + useQuery):
 * ```ts
 * import { useQueryCache, useQuery, createApiAgent, reactive, effect } from '@pastweb/tools';
 *
 * export function dataMediator(props: any, extras: any) {
 *   const queryCache = useQueryCache();
 *   const api = createApiAgent({ queryCache });
 *
 *   const usersQuery = useQuery({
 *     queryKey: ['users'],
 *     fn: () => api.get('/users'),
 *   });
 *
 *   const state = reactive({
 *     users: [] as any[],
 *   });
 *
 *   effect(() => {
 *     state.users = usersQuery.data ?? [];
 *   });
 *
 *   return { state, usersQuery };
 * }
 * ```
 *
 * @example
 * Setting up the context (usually at the root/entry):
 * ```ts
 * import { createMediatorContextUtils, createQueryCache, setAsGlobalContext } from '@pastweb/tools';
 * // ...
 * const queryCache = createQueryCache();
 * const mediatorContext = { getContext: ..., setContext: ... }; // from global context setup
 *
 * // In the mediator setup:
 * setContext(QUERY_CACHE_CONTEXT_KEY, queryCache); // using the utils from getContextUtils in root
 *
 * const result = createMediatorContextUtils(myMediator, props, extras, mediatorContext);
 * ```
 */
export function useQueryCache(): QueryCache | undefined {
  const { getContext } = getContextUtils();
  const cache = getContext<QueryCache>(QUERY_CACHE_CONTEXT_KEY);

  if (!cache) {
    console.error(
      'useQueryCache must be called within a QueryCache context.\n' +
      'Make sure the QueryCache is properly set up in the Global Context ' +
      '(e.g. setContext(QUERY_CACHE_CONTEXT_KEY, queryCache) before calling the mediator).'
    );
    return undefined;
  }

  return cache;
}
