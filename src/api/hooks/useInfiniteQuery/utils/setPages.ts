import type { InfiniteQuerySettings } from '../types';

/**
 * Updates the page list, its data alias, and the matching page parameters.
 * @example
 * ```ts
 * setPages(settings, pages, pageParams);
 * ```
 */
export function setPages<TPage, TPageParam>(
  settings: InfiniteQuerySettings<TPage, TPageParam>,
  pages: TPage[],
  pageParams: TPageParam[],
): void {
  settings.query.pages = pages;
  settings.query.data = pages;
  settings.query.pageParams = pageParams;
}
