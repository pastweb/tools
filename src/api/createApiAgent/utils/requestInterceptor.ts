import { deepMerge } from '../../../deepMerge';
import { isExcluded } from './isExcluded';
import type { InternalAxiosRequestConfig } from 'axios';
import type { AgentSettings } from '../types';

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
