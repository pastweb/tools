import { isSSR } from '../../isSSR';
import { createBrowserHistory } from 'history';
import type { RouterOptions, RouterNormalizedOptions } from '../types';

export function normalizeOptions(options: RouterOptions): RouterNormalizedOptions {
  const {
    history = createBrowserHistory(),
    debug,
    base = '',
    routes,
    preloader,
    href = isSSR ? '' : window.location.href,
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
    href,
    RouterView,
    beforeRouteParse,
    beforeRouteSelect,
    sensitive,
  };
}
