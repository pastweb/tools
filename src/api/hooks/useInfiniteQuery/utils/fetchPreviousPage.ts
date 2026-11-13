import { runFetchPreviousPage } from './runFetchPreviousPage';
import type { InfiniteQuerySettings } from '../types';

/**
 * Starts the previous-page fetch when available and deduplicates overlapping calls.
 * @example
 * ```ts
 * await fetchPreviousPage(settings);
 * ```
 */
export async function fetchPreviousPage<TPage, TPageParam>(
  settings: InfiniteQuerySettings<TPage, TPageParam>,
): Promise<void> {
  if (!settings.query.hasPreviousPage || settings.previousPageParam === undefined) return;
  if (settings.activePreviousFetch) return settings.activePreviousFetch;

  const currentFetchId = ++settings.fetchId;
  settings.activePreviousFetch = runFetchPreviousPage(settings, currentFetchId, settings.previousPageParam);
  await settings.activePreviousFetch;
  settings.activePreviousFetch = null;
}
