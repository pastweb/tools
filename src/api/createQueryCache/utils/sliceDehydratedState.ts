import { serializeQueryKey } from './serializeQueryKey';

/**
 * Extracts a subset of a dehydrate snapshot for partial hydration (e.g. per Island).
 *
 * @param snapshot - JSON string from {@link QueryCache.dehydrate}.
 * @param queryKeys - Structured query keys (arrays) or string keys to include in the slice.
 * @returns JSON string containing only matching cache entries (empty object if none match).
 *
 * @example
 * ```ts
 * const full = await queryCache.dehydrate();
 * const cartSlice = sliceDehydratedState(full, [['cart']]);
 * // Inject cartSlice into <script data-island="cart"> before island hydrateRoot
 * ```
 */
export function sliceDehydratedState(snapshot: string, queryKeys: unknown[]): string {
  if (!snapshot || !queryKeys?.length) return '{}';

  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(snapshot);
    if (!parsed || typeof parsed !== 'object') return '{}';
  } catch {
    return '{}';
  }

  if (parsed.$pastweb === 2) {
    const envelope = parsed as { queries: Record<string, unknown>; adapters: Record<string, { operations: Record<string, unknown>; entries: Record<string, { operationKey: number }> }> };
    const adapters: Record<string, unknown> = {};
    for (const [id, snapshot] of Object.entries(envelope.adapters ?? {})) {
      const entries: Record<string, { operationKey: number }> = {};
      const operations: Record<string, unknown> = {};
      for (const key of queryKeys) {
        const serialized = serializeQueryKey(key);
        const entry = snapshot.entries?.[serialized];
        if (entry) {
          entries[serialized] = entry;
          operations[entry.operationKey] = snapshot.operations[entry.operationKey];
        }
      }
      if (Object.keys(entries).length) adapters[id] = { entries, operations };
    }
    return JSON.stringify({ $pastweb: 2, queries: JSON.parse(sliceDehydratedState(JSON.stringify(envelope.queries), queryKeys)), adapters });
  }

  const result: Record<string, unknown> = {};

  for (const key of queryKeys) {
    const serialized = serializeQueryKey(key);
    if (serialized && parsed[serialized] !== undefined) {
      result[serialized] = parsed[serialized];
    }
  }

  return JSON.stringify(result);
}
