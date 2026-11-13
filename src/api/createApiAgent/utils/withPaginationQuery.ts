import type { Agent, QueryOptions } from '../types';

/**
 * Converts an explicit page option to the compatible offset/limit URL query.
 * Existing URLs are preserved when no page is supplied.
 * @example
 * ```ts
 * withPaginationQuery(agent, '/users', { page: 3, limit: 10 });
 * // '/users?offset=20&limit=10'
 * ```
 */
export function withPaginationQuery(agent: Agent, url: string, options?: QueryOptions): string {
  if (options?.page === undefined) return url;
  const hashIndex = url.indexOf('#');
  const hash = hashIndex < 0 ? '' : url.slice(hashIndex);
  const pathAndQuery = hashIndex < 0 ? url : url.slice(0, hashIndex);
  const queryIndex = pathAndQuery.indexOf('?');
  const path = queryIndex < 0 ? pathAndQuery : pathAndQuery.slice(0, queryIndex);
  const query = new URLSearchParams(queryIndex < 0 ? '' : pathAndQuery.slice(queryIndex + 1));
  const limit = agent.getPageLimit(options.limit ?? query.get('limit') ?? undefined);
  const offset = agent.pageToOffset(options.page, limit);
  if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit <= 0) {
    throw new RangeError('Pagination requires a positive page and limit.');
  }
  query.set('offset', String(offset));
  query.set('limit', String(limit));
  return `${path}?${query}${hash}`;
}
