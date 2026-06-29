import type { AxiosRequestConfig } from 'axios';

/**
 * Extracts a JSON-serializable subset of an Axios config for SSR snapshots.
 *
 * @internal
 */
export function getSerializableConfig(config: AxiosRequestConfig): Partial<AxiosRequestConfig> {
  const { url, method, baseURL, headers, params, timeout } = config;
  return { url, method, baseURL, headers, params, timeout };
}
