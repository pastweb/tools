import { fetchPage } from './fetchPage';
import { getErrorResponseStatus, setQueryFetchStatus } from '../../utils';
import type { InfiniteQuerySettings } from '../types';

/**
 * Executes a replacement fetch and updates its loading and error state.
 * @example
 * ```ts
 * await runFetchFirstPage(settings, settings.fetchId);
 * ```
 */
export async function runFetchFirstPage<TPage, TPageParam>(
  settings: InfiniteQuerySettings<TPage, TPageParam>,
  currentFetchId: number,
): Promise<void> {
  setQueryFetchStatus(settings.query, 'fetching');
  settings.query.isError = false;
  settings.query.error = null;

  try {
    await fetchPage(settings, settings.config.initialPageParam, 'replace', currentFetchId);
  } catch (err) {
    if (currentFetchId !== settings.fetchId) return;

    settings.query.status = 'error';
    settings.query.responseStatus = getErrorResponseStatus(err);
    settings.query.isPending = false;
    settings.query.isError = true;
    settings.query.error = err;
    settings.query.hasNextPage = false;
    settings.query.hasPreviousPage = false;
  } finally {
    if (currentFetchId !== settings.fetchId) return;
    setQueryFetchStatus(settings.query, 'idle');
  }
}
