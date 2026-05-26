import { isSSR } from '../../isSSR';
import { createBrowserHistory } from 'history';
import type { RouterOptions, RouterNormalizedOptions } from '../types';

export function normalizeOptions(options: RouterOptions): RouterNormalizedOptions {
  const {
    history = isSSR ? undefined : createBrowserHistory(),
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
