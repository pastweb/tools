import type { QuerySettings } from '../types';

/**
 * Applies a REST cache update to a live query.
 * @example
 * ```ts
 * updateData(settings, users);
 * ```
 */
export function updateData<T>(settings: QuerySettings<T>, data: T): void {
  if (settings.disposed) return;
  const { query } = settings;
  query.data = data;
  query.status = 'success';
  query.isPending = false;
  query.isLoading = false;
  query.isError = false;
  query.error = null;
  query.isPlaceholderData = false;
}
