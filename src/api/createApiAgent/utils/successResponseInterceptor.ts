import { decode } from '@toon-format/toon';
import { offsetToPage } from './offsetToPage';
import { parseContentRange } from './parseContentRange';
import { getHeader } from './getHeader';
import type { AxiosResponse } from 'axios';
import type { AgentSettings, Pagination, PaginationConfig } from '../types';

/**
 * Intercepts and handles successful responses.
 *
 * @param res - The response.
 * @returns The unmodified response.
 */
export async function successResponseInterceptor(
  settings: AgentSettings,
  res: AxiosResponse,
): Promise<AxiosResponse | Pagination<any>> {
  const contentType = getHeader(res.headers, 'content-type')?.toLowerCase() ?? '';

  if (contentType.includes('text/toon')) {
    const data = typeof res.data?.text === 'function' ? await res.data.text() : res.data;
    res.data = decode(typeof data === 'string' ? data : String(data));
    return res;
  }

  if (contentType.includes('application/json')) {
    const data = res.data.json ? await res.data.json() : res.data;

    const { pagination } = settings.options;
    if (pagination) {
      const { header, defaultPageLimit } = pagination as PaginationConfig;
      const contentRangeStr = getHeader(res.headers, header as string);

      if (contentRangeStr) {
        const { start, end, total } = parseContentRange(contentRangeStr);
        const limit = new URLSearchParams(res.config.url).get('limit');
        const size = limit ? parseInt(limit, 10) : defaultPageLimit as number;

        (res as Pagination<any>).pagination = {
          current: offsetToPage(start, size),
          of: Math.ceil(total / size),
          start,
          end,
          total,
          size,
        };
      }
    }

    res.data = data;
  }

  if (contentType.includes('text/plain')) {
    res.data = typeof res.data?.text === 'function' ? await res.data.text() : res.data;
  }

  return res;
}
