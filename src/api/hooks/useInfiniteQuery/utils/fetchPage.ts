import { setPages } from './setPages';
import { updatePage } from './updatePage';
import { resolvePageParams } from './resolvePageParams';
import { runWithRetry } from '../../utils';
import type { InfiniteQuerySettings } from '../types';

/**
 * Loads a page with retries, updates page order, and registers cache updates.
 * @example
 * ```ts
 * await fetchPage(settings, pageParam, 'append', settings.fetchId);
 * ```
 */
export async function fetchPage<TPage, TPageParam>(
  settings: InfiniteQuerySettings<TPage, TPageParam>,
  pageParam: TPageParam,
  mode: 'replace' | 'append' | 'prepend',
  currentFetchId: number,
): Promise<void> {
  const { fn, retry, retryDelay } = settings.config;
  const pageIndex = mode === 'replace' ? 0 : settings.query.pages.length;
  const response = await runWithRetry(() => fn(pageParam), retry, retryDelay);
  if (currentFetchId !== settings.fetchId) return;

  const nextPages = mode === 'replace'
    ? [response.data]
    : mode === 'prepend'
      ? [response.data, ...settings.query.pages]
      : [...settings.query.pages, response.data];
  const nextPageParams = mode === 'replace'
    ? [pageParam]
    : mode === 'prepend'
      ? [pageParam, ...settings.query.pageParams]
      : [...settings.query.pageParams, pageParam];

  settings.query.status = 'success';
  settings.query.responseStatus = response.status ?? null;
  settings.query.pagination = response.pagination ?? null;
  settings.query.isPending = false;
  settings.query.isError = false;
  settings.query.error = null;
  settings.query.isPlaceholderData = false;
  setPages(settings, nextPages, nextPageParams);
  if (mode === 'replace') {
    settings.firstPageResponse = response;
    settings.lastPageResponse = response;
  } else if (mode === 'prepend') {
    settings.firstPageResponse = response;
  } else {
    settings.lastPageResponse = response;
  }
  response.onData?.((page: TPage) => updatePage(settings, mode === 'prepend' ? 0 : pageIndex, page));
  resolvePageParams(settings);
}
