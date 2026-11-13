import type { ApiResult } from '../../result';
import type { QuerySettings } from '../types';

/**
 * Applies the current REST or GraphQL result, preserving partial data and errors.
 * @example
 * ```ts
 * applyResult(settings, response, settings.fetchId);
 * ```
 */
export function applyResult<T>(settings: QuerySettings<T>, result: ApiResult<T>, currentFetchId: number): void {
  if (settings.disposed || currentFetchId !== settings.fetchId) return;
  const { query } = settings;
  query.isError = !!result.error;
  query.error = result.error ?? null;
  query.extensions = result.extensions ?? null;
  query.status = result.error ? 'error' : 'success';
  query.responseStatus = result.status ?? null;
  query.isPending = false;
  query.data = result.data as T;
  query.isPlaceholderData = false;
  query.pagination = result.pagination ?? null;
}
