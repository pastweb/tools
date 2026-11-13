import { isExcluded } from '../../createApiAgent/utils/isExcluded';
import type { OperationContext } from '@urql/core';
import type { AgentSettings } from '../../createApiAgent/types';

/**
 * Bridges authentication at fetch time, including urql-initiated re-executions.
 * @example
 * ```ts
 * const context = await getOperationContext(settings, '/graphql', {});
 * ```
 */
export async function getOperationContext(settings: AgentSettings, endpoint: string, context: Partial<OperationContext> = {}, defaults: RequestInit | (() => RequestInit) = {}, defaultFetch?: typeof fetch): Promise<Partial<OperationContext>> {
  const url = context.url ?? endpoint;
  const base = typeof defaults === 'function' ? defaults() : defaults;
  const override = typeof context.fetchOptions === 'function' ? context.fetchOptions() : context.fetchOptions;
  const explicitHeaders = new Headers(override?.headers);
  const headers = new Headers(base.headers);
  for (const [key, value] of Object.entries(settings.options.headers ?? {})) if (value != null) headers.set(key, String(value));
  explicitHeaders.forEach((value, key) => headers.set(key, value));
  const transport = context.fetch ?? defaultFetch ?? globalThis.fetch;
  return {
    ...context,
    url,
    fetchOptions: { ...base, ...(settings.options.withCredentials ? { credentials: 'include' as const } : {}), ...override, headers: Object.fromEntries(headers.entries()) },
    fetch: async (input, init) => {
      const requestHeaders = new Headers(init?.headers);
      if (!isExcluded(settings, url) && settings.options.onGetValidToken) {
        const token = await settings.options.onGetValidToken();
        if (!token) throw new Error('GraphQL request aborted: no valid authentication token.');
        for (const [key, value] of Object.entries(token)) {
          if (value != null && !explicitHeaders.has(key)) requestHeaders.set(key, String(value));
        }
      }
      const response = await transport(input, { ...init, headers: requestHeaders });
      if (response.status === 401 || response.status === 403) await settings.options.onUnauthorizedResponse?.();
      return response;
    },
  };
}
