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

  const result: Record<string, unknown> = {};

  for (const key of queryKeys) {
    const serialized = serializeQueryKey(key);
    if (serialized && parsed[serialized] !== undefined) {
      result[serialized] = parsed[serialized];
    }
  }

  return JSON.stringify(result);
}
