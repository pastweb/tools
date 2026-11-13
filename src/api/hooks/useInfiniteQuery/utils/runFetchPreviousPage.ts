import { fetchPage } from './fetchPage';
import { getErrorResponseStatus, setQueryFetchStatus } from '../../utils';
import type { InfiniteQuerySettings } from '../types';

/**
 * Executes a prepend fetch and updates its loading and error state.
 * @example
 * ```ts
 * await runFetchPreviousPage(settings, settings.fetchId, pageParam);
 * ```
 */
export async function runFetchPreviousPage<TPage, TPageParam>(
  settings: InfiniteQuerySettings<TPage, TPageParam>,
  currentFetchId: number,
  pageParam: TPageParam,
): Promise<void> {
  setQueryFetchStatus(settings.query, 'fetching');
  settings.query.isFetchingPreviousPage = true;
  settings.query.isError = false;
  settings.query.error = null;

  try {
    await fetchPage(settings, pageParam, 'prepend', currentFetchId);
  } catch (err) {
    if (currentFetchId !== settings.fetchId) return;

    settings.query.status = 'error';
    settings.query.responseStatus = getErrorResponseStatus(err);
    settings.query.isPending = false;
    settings.query.isError = true;
    settings.query.error = err;
  } finally {
    if (currentFetchId !== settings.fetchId) return;
    settings.query.isFetchingPreviousPage = false;
    setQueryFetchStatus(settings.query, 'idle');
  }
}
