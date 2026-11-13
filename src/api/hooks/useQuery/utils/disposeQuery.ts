import type { QuerySettings } from '../types';

/**
 * Stops live subscriptions and prevents later results from changing a disposed query.
 * @example
 * ```ts
 * disposeQuery(settings);
 * ```
 */
export function disposeQuery<T>(settings: QuerySettings<T>): void {
  settings.disposed = true;
  settings.fetchId++;
  settings.unsubscribe?.();
}
