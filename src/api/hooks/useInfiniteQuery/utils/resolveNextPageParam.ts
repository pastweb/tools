import { getDefaultNextPageParam } from './getDefaultNextPageParam';
import { normalizePageParam } from './normalizePageParam';
import type { InfiniteQuerySettings } from '../types';
import type { QueryResponse } from '../../../createApiAgent';

/**
 * Resolves the next page using the configured callback or pagination metadata.
 * @example
 * ```ts
 * resolveNextPageParam(settings, response, pageParam);
 * ```
 */
export function resolveNextPageParam<TPage, TPageParam>(
  settings: InfiniteQuerySettings<TPage, TPageParam>,
  lastPage: QueryResponse<TPage>,
  lastPageParam: TPageParam,
): void {
  const { getNextPageParam } = settings.config;
  const next = getNextPageParam
    ? getNextPageParam(
      lastPage,
      settings.query.pages,
      lastPageParam,
      settings.query.pageParams,
    )
    : getDefaultNextPageParam<TPage, TPageParam>(lastPage.pagination ?? null);

  settings.nextPageParam = normalizePageParam(next);
  settings.query.hasNextPage = settings.nextPageParam !== undefined;
}
