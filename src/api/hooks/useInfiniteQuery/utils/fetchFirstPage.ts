import { runFetchFirstPage } from './runFetchFirstPage';
import type { InfiniteQuerySettings } from '../types';

/**
 * Starts a replacement fetch and deduplicates overlapping replacement calls.
 * @example
 * ```ts
 * await fetchFirstPage(settings);
 * ```
 */
export async function fetchFirstPage<TPage, TPageParam>(settings: InfiniteQuerySettings<TPage, TPageParam>): Promise<void> {
  if (settings.activeFetch) return settings.activeFetch;

  const currentFetchId = ++settings.fetchId;
  settings.activeFetch = runFetchFirstPage(settings, currentFetchId);
  await settings.activeFetch;
  settings.activeFetch = null;
}
