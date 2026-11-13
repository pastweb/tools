/**
 * Reads an HTTP status from an error response when one is available.
 * @example
 * ```ts
 * const status = getErrorResponseStatus(error);
 * ```
 */
export function getErrorResponseStatus(error: unknown): number | null {
  const status = (error as { response?: { status?: unknown } })?.response?.status;
  return typeof status === 'number' ? status : null;
}
