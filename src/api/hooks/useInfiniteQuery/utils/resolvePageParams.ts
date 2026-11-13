import { resolveNextPageParam } from './resolveNextPageParam';
import { resolvePreviousPageParam } from './resolvePreviousPageParam';
import type { InfiniteQuerySettings } from '../types';

/**
 * Updates navigation availability from the first and last loaded responses.
 * @example
 * ```ts
 * resolvePageParams(settings);
 * ```
 */
export function resolvePageParams<TPage, TPageParam>(settings: InfiniteQuerySettings<TPage, TPageParam>): void {
  if (settings.lastPageResponse) {
    resolveNextPageParam(settings, settings.lastPageResponse, settings.query.pageParams[settings.query.pageParams.length - 1]);
  } else {
    settings.nextPageParam = undefined;
    settings.query.hasNextPage = false;
  }

  if (settings.firstPageResponse) {
    resolvePreviousPageParam(settings, settings.firstPageResponse, settings.query.pageParams[0]);
  } else {
    settings.previousPageParam = undefined;
    settings.query.hasPreviousPage = false;
  }
}
