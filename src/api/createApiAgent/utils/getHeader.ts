/**
 * Reads a header value from fetch-like Headers, AxiosHeaders, or a plain object.
 */
export function getHeader(headers: unknown, name: string): string | null {
  if (!headers) return null;

  const getter = (headers as { get?: (key: string) => unknown }).get;
  if (typeof getter === 'function') {
    const value = getter.call(headers, name);
    return typeof value === 'string' ? value : value == null ? null : String(value);
  }

  const target = name.toLowerCase();
  const entry = Object.entries(headers as Record<string, unknown>)
    .find(([key]) => key.toLowerCase() === target);
  if (!entry) return null;

  const value = entry[1];
  return typeof value === 'string' ? value : value == null ? null : String(value);
}
