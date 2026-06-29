import { appendHeaderValue } from './appendHeaderValue';
import { getHeader } from './getHeader';
import type { AxiosHeaderValue, AxiosRequestConfig } from 'axios';

const TOON_ACCEPT_HEADER = 'text/toon';

/**
 * Returns a request config with `Accept: text/toon` appended for TOON-aware GETs.
 */
export function withToonAcceptHeader(config: AxiosRequestConfig): AxiosRequestConfig {
  const headers: Record<string, AxiosHeaderValue> = { ...(config.headers as Record<string, AxiosHeaderValue> | undefined) };
  const acceptKey = Object.keys(headers).find(key => key.toLowerCase() === 'accept') ?? 'Accept';
  const currentAccept = getHeader(headers, 'Accept');

  headers[acceptKey] = appendHeaderValue(currentAccept, TOON_ACCEPT_HEADER);

  return {
    ...config,
    headers,
  };
}
