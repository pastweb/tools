import axios from 'axios';
import {
  setAgentOptions,
  mergeAgentConfig,
  getMethod,
  postMethod,
  putMethod,
  deleteMethod,
  download,
  upload,
  patchMethod,
  requestInterceptor,
  successResponseInterceptor,
  errorResponseInterceptor,
} from './utils';
import type { AxiosRequestConfig } from 'axios';
import type {
  Agent,
  AgentOptions,
  AgentSettings,
  MutationOptions,
  PageLimit,
  PageNumber,
  QueryOptions,
} from './types';

/**
 * Creates a configured Axios-based API client ("agent") with optional caching,
 * pagination support, request interceptors for auth, and SSR-friendly query collection.
 *
 * Caching / SSR collection is enabled by passing a `queryCache` (recommended):
 *   const queryCache = createQueryCache();
 *   const api = createApiAgent({ queryCache });
 *
 * @param options - Configuration for the agent (headers, credentials, queryCache, pagination, auth hooks, etc.).
 * @returns An `Agent` object exposing `get`, `post`, `put`, `delete`, `upload`, `download`,
 *          and pagination utilities. Use the `queryCache` you passed for dehydrate/hydrate/invalidate.
 *
 * @example
 * ```ts
 * import { createApiAgent, createQueryCache } from '@pastweb/tools';
 *
 * const queryCache = createQueryCache();
 * const api = createApiAgent({
 *   queryCache,
 *   headers: { Accept: 'application/json' },
 *   withCredentials: true,
 *   onGetValidToken: () => ({ Authorization: `Bearer ${getToken()}` }),
 * });
 *
 * const res = await api.get('/users', { expireIn: '2m' });
 * // later for SSR:
 * const snapshot = await queryCache.dehydrate();
 * ```
 */
export function createApiAgent(options: AgentOptions = {}): Agent {
  const settings: AgentSettings = {
    options,
    agentConfig: { headers: {} },
    uploadConfig: {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
    downloadConfig: {
      responseType: 'blob',
    }
  };

  setAgentOptions(settings, options);

  const agent = axios.create();
  agent.interceptors.request.use(request => requestInterceptor(settings, request));
  agent.interceptors.response.use(
    request => successResponseInterceptor(settings, request),
    request => errorResponseInterceptor(settings, request),
  );

  const queryCache = settings.options.queryCache;

  const agentObject: Agent = {
    agent,
    agentConfig: settings.agentConfig,
    downloadConfig: settings.downloadConfig,
    uploadConfig: settings.uploadConfig,
    setAgentOptions: (options: AgentOptions) => setAgentOptions(settings, options),
    mergeAgentConfig: (newSettings: AxiosRequestConfig) => mergeAgentConfig(settings, newSettings),
    /**
     * Returns the effective page limit. Falls back to the agent's pagination default (100).
     */
    getPageLimit(limit: PageLimit = (settings.options as any).pagination.pageLimit as number || 100): number {
      return parseInt(limit as string, 10);
    },
    /**
     * Normalizes a page value (number, string from query params, or null) to a number (defaults to 1).
     */
    getPageNumber(page: PageNumber = 1): number {
      return parseInt(page as string, 10);
    },
    /**
     * Converts a (1-based) page + limit into a 0-based offset.
     * Example: `pageToOffset(3, 20) === 40`
     */
    pageToOffset(page?: PageNumber, limit?: PageLimit): number {
      const pageValue = this.getPageNumber(page);
      const limitValue = this.getPageLimit(limit);
      return (pageValue - 1) * limitValue;
    },
    download: (url: string, fileName: string, config?: AxiosRequestConfig & { domElement?: HTMLElement; }) => download(settings, agent, url, fileName, config, queryCache),
    delete: (url: string, options?: MutationOptions) => deleteMethod(settings, agent, url, options, queryCache),
    get: (url: string, options?: QueryOptions) => getMethod(settings, agent, url, options, queryCache),
    patch: (url: string, data?: unknown, options?: MutationOptions) => patchMethod(settings, agent, url, data, options),
    post: (url: string, data?: unknown, options?: MutationOptions) => postMethod(settings, agent, url, data, options),
    put: (url: string, data?: unknown, options?: MutationOptions) => putMethod(settings, agent, url, data, options),
    upload: (url: string, data: FormData, config?: AxiosRequestConfig) => upload(settings, agent, url, data, config),
  };

  Object.defineProperties(agentObject, {
    agentConfig: { get() { return settings.agentConfig; } },
    downloadConfig: { get() { return settings.downloadConfig; } },
    uploadConfig: { get() { return settings.uploadConfig; } },
  });

  return agentObject;
}
