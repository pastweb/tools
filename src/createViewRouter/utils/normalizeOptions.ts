import { isBrowser } from '../../envs';
import { createBrowserHistory } from 'history';
import type { RouterOptions, RouterNormalizedOptions } from '../types';

/**
 * Normalizes user-provided RouterOptions into a consistent internal format.
 *
 * Applies defaults (e.g. history in browser, sensitive=false, debug=false, base='').
 * This is called internally by createViewRouter.
 *
 * @param options - The raw options passed to createViewRouter
 * @returns Normalized options with all required fields populated
 */
export function normalizeOptions(options: RouterOptions): RouterNormalizedOptions {
  const {
    history = isBrowser ? createBrowserHistory() : undefined,
    debug,
    base = '',
    routes,
    preloader,
    RouterView,
    beforeRouteParse,
    beforeRouteSelect,
    sensitive = false,
  } = options;

  return {
    base,
    debug: !!debug,
    history,
    routes,
    preloader,
    RouterView,
    beforeRouteParse,
    beforeRouteSelect,
    sensitive,
  };
}
