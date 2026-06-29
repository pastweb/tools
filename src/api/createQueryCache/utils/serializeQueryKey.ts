/**
 * Serializes a `queryKey` to the string used as the internal cache map key.
 *
 * - Arrays are `JSON.stringify`'d (e.g. `['user', 1]` -> `'["user",1]'`).
 * - Strings are returned as-is.
 * - Other values use `String(queryKey)`.
 * - `null` / `undefined` -> `''` (caller should fall back to the request URL).
 *
 * @param queryKey - Structured key, legacy string key, or other value.
 * @returns Serialized cache key.
 */
export function serializeQueryKey(queryKey: unknown): string {
  if (queryKey == null) return '';

  if (typeof queryKey === 'string') return queryKey;

  if (Array.isArray(queryKey)) {
    return JSON.stringify(queryKey);
  }

  return String(queryKey);
}
