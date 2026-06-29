import { reactive, effect } from '../../reactivity';
import { useRouter } from '../useRouter';
import type { RouterLink, RouterLinkOptions } from '../types';

/**
 * Returns a reactive `RouterLink` object (transparent readonly proxy powered by `computed`)
 * for the given descriptor.
 *
 * This hook is intended to be called from within a mediator function (see `createMediatorContextUtils`
 * and `getContextUtils` from `@pastweb/tools/globalContext`). It relies on `useRouter` to retrieve
 * the `ViewRouter` instance from the current mediator context.
 *
 * The returned value is a stable computed proxy over the result of `router.getRouterLink(options)`.
 * Properties like `isActive`, `isExactActive`, `pathname` (and the `navigate` function) are
 * automatically fresh whenever the router location changes. Direct access works:
 *
 * ```ts
 * const link = useRouterLink({ path: '/about' });
 * effect(() => {
 *   console.log('About active?', link.isActive);
 * });
 * ```
 *
 * Leverages object-shaped `computed` for a clean direct API (no `.value`) with full reactivity
 * and mediator-capture safety.
 *
 * @param options - Router link options (`path` is required; `params`, `searchParams`, and `hash` are optional).
 * @returns A reactive `RouterLink` proxy.
 *
 * @example
 * Using inside a mediator:
 * ```ts
 * import { useRouterLink, reactive, effect } from '@pastweb/tools';
 *
 * export function myMediator(props: any, extras: any) {
 *   const homeLink = useRouterLink({ path: '/' });
 *   const aboutLink = useRouterLink({ path: '/about' });
 *
 *   const state = reactive({
 *     homeActive: false,
 *     aboutActive: false,
 *   });
 *
 *   effect(() => {
 *     // This will re-run whenever the current location makes isActive change
 *     state.homeActive = homeLink.isActive;
 *     state.aboutActive = aboutLink.isActive;
 *   });
 *
 *   return { state };
 * }
 * ```
 */
export function useRouterLink(options: RouterLinkOptions): RouterLink {
  const router = useRouter();
  const { path, params, searchParams, hash } = options;
  const link = reactive<RouterLink>(router.getRouterLink({
    path,
    params,
    searchParams,
    hash,
  }));

  function setLink() {
    const { path, params, searchParams, hash } = options;
    Object.assign(link, router.getRouterLink({
      path,
      params,
      searchParams,
      hash,
    }));
  }

  effect(setLink, router.currentRoute);

  return link;
}
