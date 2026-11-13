import type { InfiniteQueryInfo } from '../types';

/**
 * Derives the next page number from response pagination metadata.
 * @example
 * ```ts
 * const next = getDefaultNextPageParam(pagination);
 * ```
 */
export function getDefaultNextPageParam<TPage, TPageParam>(
  pagination: InfiniteQueryInfo<TPage, TPageParam>['pagination'],
): TPageParam | undefined {
  if (!pagination || pagination.current >= pagination.of) return undefined;
  return (pagination.current + 1) as TPageParam;
}
