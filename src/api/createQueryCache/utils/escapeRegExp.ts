/**
 * Escapes special characters in a string to create a valid RegExp pattern.
 *
 * @param str - Raw prefix string.
 * @returns Regex-safe string.
 *
 * @internal
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
