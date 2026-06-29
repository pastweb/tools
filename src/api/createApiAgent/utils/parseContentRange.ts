import type { ParsedContentRange } from '../types';

/**
 * Parses a Content-Range header value of the form "start-end/total".
 * @param contentRangeStr - The header value, e.g. "0-9/100".
 * @returns Parsed start, end, total numbers.
 */
export function parseContentRange(contentRangeStr: string): ParsedContentRange {
  const [startEnd, total] = contentRangeStr.split('/');
  const [start, end] = startEnd.split('-');

  return {
    start: parseInt(start, 10),
    end: parseInt(end, 10),
    total: parseInt(total, 10),
  };
}
