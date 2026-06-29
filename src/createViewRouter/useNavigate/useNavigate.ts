import { useRouter } from '../useRouter';

/**
 * Returns the `navigate` function from the current `ViewRouter` instance.
 *
 * This hook is intended to be called from within a mediator function (see `createMediatorContextUtils`
 * and `getContextUtils` from `@pastweb/tools/globalContext`). It relies on `useRouter` to retrieve
 * the `ViewRouter` instance from the current mediator context.
 *
 * It provides a convenient way to perform imperative navigation from within a mediator
 * without needing to access the full router object.
 *
 * @returns The navigate function: `(path: string, state?: any) => Promise<void>`
 *
 * @example
 * Using inside a mediator for navigation:
 * ```ts
 * import { useNavigate, reactive, effect } from '@pastweb/tools';
 *
 * export function myMediator(props: MyProps) {
 *   const navigate = useNavigate();
 *
 *   const state = reactive({
 *     isLoading: false,
 *   });
 *
 *   async function handleSubmit() {
 *     state.isLoading = true;
 *     // ... perform action
 *     await navigate('/success');
 *   }
 *
 *   return {
 *     state,
 *     handleSubmit,
 *   };
 * }
 * ```
 *
 * @example
 * With state:
 * ```ts
 * const navigate = useNavigate();
 * navigate('/profile', { from: 'dashboard' });
 * ```
 */
export function useNavigate(): (path: string, state?: any) => Promise<void> {
  const router = useRouter();
  return router.navigate;
}
