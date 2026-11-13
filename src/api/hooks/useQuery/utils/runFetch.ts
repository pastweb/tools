import { getErrorResponseStatus, runWithRetry, setQueryFetchStatus } from '../../utils';
import { applyResult } from './applyResult';
import type { QuerySettings } from '../types';

/**
 * Executes a query with retries and connects REST or GraphQL cache updates.
 * @example
 * ```ts
 * await runFetch(settings, settings.fetchId);
 * ```
 */
export async function runFetch<T>(settings: QuerySettings<T>, currentFetchId: number): Promise<void> {
  const { query, config } = settings;
  setQueryFetchStatus(query, 'fetching');
  query.isError = false;
  query.error = null;
  try {
    const response = await runWithRetry(config.fn, config.retry, config.retryDelay);
    if (currentFetchId !== settings.fetchId) return;
    applyResult(settings, response, currentFetchId);
    if (response.onResult) {
      settings.unsubscribe = response.onResult(result => applyResult(settings, result, currentFetchId));
    } else response.onData?.(settings.onData);
  } catch (error) {
    if (currentFetchId !== settings.fetchId) return;
    query.status = 'error';
    query.responseStatus = getErrorResponseStatus(error);
    query.isPending = false;
    query.isError = true;
    query.error = error;
  } finally {
    if (currentFetchId !== settings.fetchId) return;
    setQueryFetchStatus(query, 'idle');
  }
}
