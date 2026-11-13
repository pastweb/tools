import type { SSRData } from '@urql/core';
import type { UrqlAdapterState } from '../types';

/**
 * Serializes only this render's registered, persistable GraphQL operations.
 * @example
 * ```ts
 * const snapshot = extractData(state);
 * ```
 */
export function extractData(state: UrqlAdapterState) {
  const all = state.ssr?.extractData() ?? {};
  const operations: SSRData = {};
  const entries: Record<string, { operationKey: number; timestamp: number; invalid: boolean }> = Object.create(null);
  const excluded = new Set([...state.entries.values()].filter(entry => entry.options.ssrMode === 'no-store').map(entry => entry.request.key));
  for (const entry of state.entries.values()) {
    if (excluded.has(entry.request.key)) continue;
    if (all[entry.request.key]) operations[entry.request.key] = all[entry.request.key];
    entries[entry.cacheKey] = { operationKey: entry.request.key, timestamp: entry.timestamp, invalid: entry.invalid };
  }
  return { operations, entries };
}
