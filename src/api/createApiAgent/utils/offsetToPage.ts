/**
 * Converts an offset + limit into a 1-based page number.
 * @param offset - Starting index.
 * @param limit - Items per page.
 * @returns Page number (1-based).
 */
export function offsetToPage(offset: number, limit: number): number {
  return Math.floor(offset / limit) + 1;
}
