/**
 * Matches explicit GraphQL query aliases by string or structured prefix.
 * @example
 * ```ts
 * matchesQueryKey('["users",2]', ['users']); // true
 * ```
 */
export function matchesQueryKey(stored: string, prefix?: unknown): boolean {
  if (prefix == null) return true;
  if (!Array.isArray(prefix)) return stored.startsWith(String(prefix));
  try {
    const value = JSON.parse(stored);
    return Array.isArray(value) && prefix.every((part, index) => JSON.stringify(part) === JSON.stringify(value[index]));
  } catch { return false; }
}
