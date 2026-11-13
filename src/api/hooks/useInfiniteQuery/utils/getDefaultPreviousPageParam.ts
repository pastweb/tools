import type { InfiniteQueryInfo } from '../types';

/**
 * Derives the previous page number from response pagination metadata.
 * @example
 * ```ts
 * const previous = getDefaultPreviousPageParam(pagination);
 * ```
 */
export function getDefaultPreviousPageParam<TPage, TPageParam>(
  pagination: InfiniteQueryInfo<TPage, TPageParam>['pagination'],
): TPageParam | undefined {
  if (!pagination || pagination.current <= 1) return undefined;
  return (pagination.current - 1) as TPageParam;
}
