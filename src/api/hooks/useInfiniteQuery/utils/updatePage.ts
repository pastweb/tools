import { setPages } from './setPages';
import type { InfiniteQuerySettings } from '../types';

/**
 * Applies a cache update to one loaded page.
 * @example
 * ```ts
 * updatePage(settings, 0, page);
 * ```
 */
export function updatePage<TPage, TPageParam>(
  settings: InfiniteQuerySettings<TPage, TPageParam>,
  index: number,
  page: TPage,
): void {
  const pages = [...settings.query.pages];
  pages[index] = page;
  setPages(settings, pages, [...settings.query.pageParams]);
  settings.query.status = 'success';
  settings.query.isPending = false;
  settings.query.isLoading = false;
  settings.query.isError = false;
  settings.query.error = null;
  settings.query.isPlaceholderData = false;
}
