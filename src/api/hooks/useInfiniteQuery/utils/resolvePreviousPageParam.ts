import { getDefaultPreviousPageParam } from './getDefaultPreviousPageParam';
import { normalizePageParam } from './normalizePageParam';
import type { InfiniteQuerySettings } from '../types';
import type { QueryResponse } from '../../../createApiAgent';

/**
 * Resolves the previous page using the configured callback or pagination metadata.
 * @example
 * ```ts
 * resolvePreviousPageParam(settings, response, pageParam);
 * ```
 */
export function resolvePreviousPageParam<TPage, TPageParam>(
  settings: InfiniteQuerySettings<TPage, TPageParam>,
  firstPage: QueryResponse<TPage>,
  firstPageParam: TPageParam,
): void {
  const { getPreviousPageParam } = settings.config;
  const previous = getPreviousPageParam
    ? getPreviousPageParam(
      firstPage,
      settings.query.pages,
      firstPageParam,
      settings.query.pageParams,
    )
    : getDefaultPreviousPageParam<TPage, TPageParam>(firstPage.pagination ?? null);

  settings.previousPageParam = normalizePageParam(previous);
  settings.query.hasPreviousPage = settings.previousPageParam !== undefined;
}
