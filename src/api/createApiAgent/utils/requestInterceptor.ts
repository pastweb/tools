import { deepMerge } from '../../../deepMerge';
import { isExcluded } from './isExcluded';
import type { InternalAxiosRequestConfig } from 'axios';
import type { AgentSettings, PaginationConfig } from '../types';

/**
 * Intercepts and modifies request configurations.
 *
 * @param requestConfig - The request configuration.
 * @returns The modified request configuration.
 */
export async function requestInterceptor(
  settings: AgentSettings,
  requestConfig: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> {
  const { url } = requestConfig;

  if (isExcluded(settings, url)) return requestConfig;

  const { pagination } = settings.options;
  if (pagination && url) {
    const query = new URL(url, 'http://localhost').searchParams;
    const offset = query.get('offset');
    const limit = query.get('limit');
    const header = (pagination as PaginationConfig).header ?? 'Content-Range';
    if (offset !== null && limit !== null && /^\d+$/.test(offset) && /^\d+$/.test(limit)
      && Number.isSafeInteger(Number(offset)) && Number.isSafeInteger(Number(limit)) && Number(limit) > 0
      && !requestConfig.headers.has(header)) {
      requestConfig.headers.set(header, `${offset}-${limit}`);
    }
  }

  const { onGetValidToken } = settings.options;

  if (!onGetValidToken) return requestConfig;

  const tokenHeader = await onGetValidToken();

  if (tokenHeader) {
    return deepMerge(requestConfig, {
      headers: { ...tokenHeader },
    }) as InternalAxiosRequestConfig;
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), 16);

  return deepMerge(requestConfig, {
    signal: controller.signal,
  }) as InternalAxiosRequestConfig;
}
