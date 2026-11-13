import { runFetch } from './runFetch';
import type { QuerySettings } from '../types';

/**
 * Starts a query fetch, deduplicating overlapping calls and replacing the subscription.
 * @example
 * ```ts
 * await fetchData(settings);
 * ```
 */
export async function fetchData<T>(settings: QuerySettings<T>): Promise<void> {
  if (settings.disposed) return;
  if (settings.activeFetch) return settings.activeFetch;
  settings.unsubscribe?.();
  settings.unsubscribe = undefined;
  const currentFetchId = ++settings.fetchId;
  settings.activeFetch = runFetch(settings, currentFetchId);
  await settings.activeFetch;
  settings.activeFetch = null;
}
