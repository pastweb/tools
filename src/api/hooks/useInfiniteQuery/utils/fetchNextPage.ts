import { runFetchNextPage } from './runFetchNextPage';
import type { InfiniteQuerySettings } from '../types';

/**
 * Starts the next-page fetch when available and deduplicates overlapping calls.
 * @example
 * ```ts
 * await fetchNextPage(settings);
 * ```
 */
export async function fetchNextPage<TPage, TPageParam>(settings: InfiniteQuerySettings<TPage, TPageParam>): Promise<void> {
  if (!settings.query.hasNextPage || settings.nextPageParam === undefined) return;
  if (settings.activeNextFetch) return settings.activeNextFetch;

  const currentFetchId = ++settings.fetchId;
  settings.activeNextFetch = runFetchNextPage(settings, currentFetchId, settings.nextPageParam);
  await settings.activeNextFetch;
  settings.activeNextFetch = null;
}
