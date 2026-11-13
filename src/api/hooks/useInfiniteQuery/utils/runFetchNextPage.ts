import { fetchPage } from './fetchPage';
import { getErrorResponseStatus, setQueryFetchStatus } from '../../utils';
import type { InfiniteQuerySettings } from '../types';

/**
 * Executes an append fetch and updates its loading and error state.
 * @example
 * ```ts
 * await runFetchNextPage(settings, settings.fetchId, pageParam);
 * ```
 */
export async function runFetchNextPage<TPage, TPageParam>(
  settings: InfiniteQuerySettings<TPage, TPageParam>,
  currentFetchId: number,
  pageParam: TPageParam,
): Promise<void> {
  setQueryFetchStatus(settings.query, 'fetching');
  settings.query.isFetchingNextPage = true;
  settings.query.isError = false;
  settings.query.error = null;

  try {
    await fetchPage(settings, pageParam, 'append', currentFetchId);
  } catch (err) {
    if (currentFetchId !== settings.fetchId) return;

    settings.query.status = 'error';
    settings.query.responseStatus = getErrorResponseStatus(err);
    settings.query.isPending = false;
    settings.query.isError = true;
    settings.query.error = err;
  } finally {
    if (currentFetchId !== settings.fetchId) return;
    settings.query.isFetchingNextPage = false;
    setQueryFetchStatus(settings.query, 'idle');
  }
}
