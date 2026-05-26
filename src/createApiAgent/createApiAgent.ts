import axios from 'axios';
import { deepMerge } from '../deepMerge';
import { isDateYoungerOf } from '../isDateYoungerOf';
import { noop } from '../noop';
import type { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  Agent,
  AgentOptions,
  MutationOptions,
  PaginationConfig,
  PageLimit,
  PageNumber,
  Pagination,
  ParsedContentRange,
  QueryCache,
  QueryData,
  QueryOptions,
  QueryResponse,
} from './types';

/**
 * Creates an API agent with customizable options for HTTP requests.
 *
 * @param {AgentOptions} [options={}] - The options for the API agent.
 * @param {boolean} [options.withCredentials=false] - Indicates whether cross-site Access-Control requests should be made using credentials.
 * @param {Record<string, any>} [options.headers={}] - Custom headers to be sent with each request.
 * @param {string | RegExp | Array<string | RegExp>} [options.exclude] - URLs or patterns to exclude from request intercepting.
 * @param {() => Promise<Record<string, any>>} [options.onGetValidToken] - Function to get a valid token for authorization.
 * @param {() => void} [options.onUnauthorizedResponse] - Callback for unauthorized responses.
 * @returns {Agent} - The configured API agent.
 */
export function createApiAgent(options: AgentOptions = {}): Agent {
  let opt = options;

  let agentConfig: AxiosRequestConfig = {
    headers: {},
  };

  let uploadConfig: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  let downloadConfig: AxiosRequestConfig = {
    responseType: 'blob',
  };

  setAgentOptions(opt);

  const agent = axios.create();
  agent.interceptors.request.use(requestInterceptor);
  agent.interceptors.response.use(successResponseInterceptor, errorResponseInterceptor);

  /**
   * Checks if a URL is excluded from request interception.
   *
   * @param {string} [url] - The URL to check.
   * @returns {boolean} - Whether the URL is excluded.
   */
  function isExcluded(url?: string): boolean {
    if (!url) return false;

    const { exclude: _exclude } = opt;
    const exclude = !_exclude ? [] : Array.isArray(_exclude) ?  _exclude : [ _exclude ];

    for (const rule of exclude) {
      if (typeof rule === 'string' && rule === url) return true;

      if (rule instanceof RegExp && (rule as RegExp).test(url)) return true;
    }

    return false;
  }

  function parseContentRange(contentRangeStr: string): ParsedContentRange {
    const [startEnd, total] = contentRangeStr.split('/');
    const [start, end] = startEnd.split('-');

    return {
      start: parseInt(start, 10),
      end: parseInt(end, 10),
      total: parseInt(total, 10),
    };
  }

  function offsetToPage(offset: number, limit: number) {
    return Math.floor(offset / limit) + 1;
  }

  /**
   * Intercepts and modifies request configurations.
   *
   * @param {AxiosRequestConfig} requestConfig - The request configuration.
   * @returns {Promise<InternalAxiosRequestConfig>} - The modified request configuration.
   */
  async function requestInterceptor(requestConfig: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
    // high function to ptint or collect some log
    const { url } = requestConfig;

    if (isExcluded(url)) return requestConfig;

    const { onGetValidToken } = opt;

    if (!onGetValidToken) return requestConfig;

    const tokenHeader = await onGetValidToken();

    if (tokenHeader) {
      return deepMerge(requestConfig, {
        headers: { ...tokenHeader },
      }) as InternalAxiosRequestConfig;
    } else {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 16);

      return deepMerge(requestConfig, {
        signal: controller.signal,
      }) as InternalAxiosRequestConfig;
    }
  }

  /**
   * Intercepts and handles successful responses.
   *
   * @param {AxiosResponse} res - The response.
   * @returns {Promise<AxiosResponse>} - The unmodified response.
   */
  async function successResponseInterceptor(res: AxiosResponse): Promise<AxiosResponse | Pagination<any>> {
    const headers = res.headers as unknown as Headers;

    if (headers.get('content-type') === 'application/json') {
      let data = res.data.json ? await res.data.json() : res.data;

      const { pagination } = opt;
      if (pagination) {
        const { header, defaultPageLimit } = pagination as PaginationConfig;
        const contentRangeStr = headers.get(header as string);

        if (contentRangeStr) {
          const { start, end, total } = parseContentRange(contentRangeStr);
          const limit = new URLSearchParams(res.config.url).get('limit');
          const size = limit ? parseInt(limit, 10) : defaultPageLimit as number;

          (res as Pagination<any>).pagination = {
            current: offsetToPage(start, size),
            of: Math.ceil(total / size),
            start: start,
            end: end,
            total: total,
            size,
          };
        }
      }

      res.data = data;
    }

    if (headers.get('content-type') === 'text/plain') {
      res.data = res.data.text();
    }

    return res;
  }

  /**
   * Intercepts and handles error responses.
   *
   * @param {AxiosError} error - The error.
   * @throws {AxiosError} - The error after processing.
   */
  async function errorResponseInterceptor(error: AxiosError): Promise<void> {
    // high function to ptint or collect some log
    if (!error || !error.response) {
      Object.assign(error, {
        statusText: 'Network Error',
        data: {
          code: 0,
          message: 'Network Error',
        },
        response: {
          data: {
            network: {
              message: 'Network Error',
              code: 'network',
              statusCode: 0,
            },
          },
        },
      });
    }

    const { status } = (error.response as AxiosResponse);
    const { onUnauthorizedResponse = noop } = opt;

    if ((status === 401) || (status === 403)) {
      await onUnauthorizedResponse();
    }
  
    throw error;
  }

  /**
   * Sets the agent configuration.
   *
   * @param {AgentOptions} [options={}] - The options for the API agent.
   */
  function setAgentOptions(options: AgentOptions): void {
    const { withCredentials = false, headers = {}, pagination = true, exclude, ...rest } = options;

    if (withCredentials) {
      agentConfig = { withCredentials, ...agentConfig };
      uploadConfig = { withCredentials, ...uploadConfig };
      downloadConfig = { withCredentials, ...downloadConfig };
    } else {
      agentConfig = {
        headers: {
          ...headers,
          ...agentConfig.headers,
        },
      };
    }
    
    const defaultPagination: PaginationConfig = {
      defaultPageLimit: 100,
      header: 'Content-Range',
    };


    opt = {
      pagination: (!pagination && typeof pagination === 'undefined') || (pagination && typeof pagination === 'boolean') ?
        defaultPagination :
        { ...defaultPagination, ...pagination },
      ...rest
    };
  }

  /**
   * Merges new settings into the existing agent configuration.
   *
   * @param {AxiosRequestConfig} newSettings - The new settings to merge.
   */
  function mergeAgentConfig(newSettings: AxiosRequestConfig): void {
    agentConfig = deepMerge(agentConfig, newSettings);
  }

  // Cache storage
  const queryCache = new Map<string, QueryData>();
  const cache: QueryCache = {
    get: (key: string) => queryCache.get(key),
    getAll: () => Array.from(queryCache),
    has: (key: string) => queryCache.has(key),
    set: (key: string, data: QueryData) => queryCache.set(key, data),
    delete: (key: string) => queryCache.delete(key),
    invalidateQuery,
  };

  /**
   * Retrieves a cached response for a query key if it is not stale.
   * @param queryKey - The query key to retrieve.
   * @returns The cached response or null if not found or stale.
   */
  function getQuery(queryKey: string): AxiosResponse | null {
    const data = queryCache.get(queryKey);
    if (!data) return null;
    if (data.invalid) return null;

    if (data.expireIn && !isDateYoungerOf(new Date(data.timestamp), data.expireIn)) {
      queryCache.set(queryKey, { ...data, invalid: true });
      return null;
    }

    return data.response;
  }

  /**
   * Saves a response to the cache with a specified expiration time.
   * @param queryKey - The query key for the cache entry.
   * @param res - The response to cache.
   * @param expireIn - The expiration time for the cache entry.
   */
  function saveQuery(queryKey: string, res: AxiosResponse, expireIn: string): void {
    const query = queryCache.get(queryKey);
    
    if (query) {
      query.invalid = false;
      query.expireIn = expireIn;
      query.timestamp = Date.now(),
      query.response = res;

      const remove: WeakRef<Function>[] = [];
      
      query.onDataCallbacks.forEach(wr => {
        const fn = wr.deref();
        if (fn) fn(res.data);
        else remove.push(wr);
      });

      remove.forEach(wr => query.onDataCallbacks.delete(wr));

      return;
    }

    const data = {
      invalid: false,
      response: res,
      timestamp: Date.now(),
      expireIn: expireIn,
      onDataCallbacks: new Set<WeakRef<Function>>(),
    };

    queryCache.set(queryKey, data);
  }

  /**
   * Escapes special characters in a string to create a valid RegExp pattern.
   * @param str - The string to escape.
   * @returns The escaped string.
   */
  function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Invalidates cache entries for a specific query key, array of query keys, or all entries.
   * If a string or string array is provided, it is treated as a URL prefix and converted to a RegExp
   * to match cache keys starting with the provided value(s).
   * @param queryKey - The query key or array of keys to invalidate (optional).
   */
  function invalidateQuery(queryKey?: string | string[]): void {
    if (!queryKey) {
      Array.from(queryCache.keys()).forEach(k => {
        const query = queryCache.get(k);
        query!.invalid = true;
        queryCache.set(k, query as QueryData);
      });

      return;
    }

    const keys = Array.isArray(queryKey) ? queryKey : [queryKey];
    const regex = keys.map(k => new RegExp(`^${escapeRegExp(k)}`));

    Array.from(queryCache.keys()).forEach(k => {
      if (regex.some(pattern => pattern.test(k))) {
        const query = queryCache.get(k);
        query!.invalid = true;
        queryCache.set(k, query as QueryData);
      }
    });
  }

  function saveDataCallback<T>(queryKey: string, fn: (data: T) => void): void {
    const query = queryCache.get(queryKey);

    if (!query) return;

    query.onDataCallbacks.add(new WeakRef(fn));
  }

  /**
   * Sends a DELETE request.
   * @param url - The URL to send the request to.
   * @param options - Optional configuration and mutation options.
   * @returns The response with parsed data.
   */
  async function _delete<T = any>(url: string, options: MutationOptions = {}): Promise<AxiosResponse<T>> {
    const { onSuccess = noop, onError = noop, ...rest } = options;
    const config = Object.keys(rest).length ? rest : agentConfig;

    if (opt.cache) {
      try {
        const res = await agent.delete(url, config);
        onSuccess();
        return res as AxiosResponse<T>;
      } catch(e) {
        onError(e);
        throw e;
      }
    }
    
    return await agent.delete(url, config);
  }

  /**
   * Sends a GET request.
   * @param url - The URL to send the request to.
   * @param options - Optional configuration and query options.
   * @returns The response with parsed data.
   */
  async function get<T = any>(url: string, options: QueryOptions = {}): Promise<QueryResponse<T>> {
    const { queryKey = url, expireIn = '', ...rest } = options;
    const config = Object.keys(rest).length ? rest : agentConfig;
    let res: QueryResponse<T>;
    
    if (opt.cache) {
      const onData  = (fn: (data: T) => void) => saveDataCallback(queryKey, fn);
      const response = getQuery(queryKey);
      if (response) res = { ...response, onData };
      else {
        res = await agent.get(url, config);
        saveQuery(queryKey, res, expireIn);
        const response = getQuery(queryKey) as QueryResponse;
        res = { ...response, onData };
      }
    } else {
      res = await agent.get(url, config);
    }

    return res;
  }

  /**
   * Sends a PATCH request.
   * @param url - The URL to send the request to.
   * @param data - The data to send with the request.
   * @param options - Optional configuration and mutation options.
   * @returns The response with parsed data.
   */
  async function patch<T = any>(url: string, data?: unknown, options: MutationOptions = {}): Promise<AxiosResponse<T>> {
    const { onSuccess = noop, onError = noop, ...rest } = options;
    const config = Object.keys(rest).length ? rest : agentConfig;

    try {
      const res = await agent.patch(url, data, config);
      onSuccess();
      return res as AxiosResponse<T>;
    } catch (e) {
      onError(e);
      throw e;
    }
  }

  /**
   * Sends a POST request.
   * @param url - The URL to send the request to.
   * @param data - The data to send with the request.
   * @param options - Optional configuration and mutation options.
   * @returns The response with parsed data.
   */
  async function post<T = any>(url: string, data?: unknown, options: MutationOptions = {}): Promise<AxiosResponse<T>> {
    const { onSuccess = noop, onError = noop, ...rest } = options;
    const config = Object.keys(rest).length ? rest : agentConfig;

    try {
      const res = await agent.post(url, data, config);
      onSuccess();
      return res as AxiosResponse<T>;
    } catch (e) {
      onError(e);
      throw e;
    }
  }

  /**
   * Sends a PUT request.
   * @param url - The URL to send the request to.
   * @param data - The data to send with the request.
   * @param options - Optional configuration and mutation options.
   * @returns The response with parsed data.
   */
  async function put<T = any>(url: string, data?: unknown, options: MutationOptions = {}): Promise<AxiosResponse<T>> {
    const { onSuccess = noop, onError = noop, ...rest } = options;
    const config = Object.keys(rest).length ? rest : agentConfig;

    try {
      const res = await agent.put(url, data, config);
      onSuccess();
      return res as AxiosResponse<T>;
    } catch (e) {
      onError(e);
      throw e;
    }
  }

  /**
   * Uploads a file using a POST request.
   *
   * @param {string} url - The URL to send the request to.
   * @param {FormData} data - The form data to send with the request.
   * @param {AxiosRequestConfig} [config] - Optional configuration for the request.
   * @returns {Promise<AxiosResponse>} - The response.
   */
  function upload<T = any>(url: string, data: FormData, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.post(url, data, deepMerge(agentConfig, uploadConfig, config));
  }

  /**
   * Downloads a file using a GET request and triggers a download in the browser.
   *
   * @param {string} url - The URL to send the request to.
   * @param {string} fileName - The name of the file to be downloaded.
   * @param {AxiosRequestConfig} [config] - Optional configuration for the request.
   * @returns {Promise<AxiosResponse>} - The response.
   */
  async function download<T = any>(url: string, fileName: string, config: AxiosRequestConfig & { domElement?: HTMLElement; } = {}): Promise<AxiosResponse<T>> {
    const { domElement = document.body, ...rest } = config;
    const res = await this.get(url, deepMerge(agentConfig, downloadConfig, rest));
    const { data } = res;
    const _url = URL.createObjectURL(data); // Create a url for the Blob
    const link = document.createElement('a'); // Create a temporary anchor tag
    link.href = _url; // Set the href attribute
    link.setAttribute('download', fileName); // The default name of the downloaded file
    domElement.appendChild(link); // Append the anchor tag to the document
    link.click(); // Start the download
    domElement.removeChild(link); // Clean up the anchor tag element
    URL.revokeObjectURL(_url); // Remove the url
    return res;
  }

  const agentObject = {
    agent,
    agentConfig,
    cache,
    downloadConfig,
    uploadConfig,
    setAgentOptions,
    mergeAgentConfig,
    getPageLimit(limit: PageLimit = (opt as any).pagination.pageLimit as number || 100): number {
      return parseInt(limit as string, 10);
    },
    getPageNumber(page: PageNumber = 1): number {
      return parseInt(page as string, 10);
    },
    pageToOffset(page?: PageNumber, limit?: PageLimit): number {
      const pageValue = this.getPageNumber(page);
      const limitValue = this.getPageLimit(limit);
      return (pageValue - 1) * limitValue;
    },
    download,
    delete: _delete,
    get,
    patch,
    post,
    put,
    upload,
  };

  Object.defineProperties(agentObject, {
    agentConfig: { get() { return agentConfig; } },
    downloadConfig: { get() { return downloadConfig; } },
    uploadConfig: { get() { return uploadConfig; } },
  });

  return agentObject;
}
