import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { QueryCache } from '../createQueryCache';

/**
 * Internal settings object used by the API agent implementation.
 * Holds the resolved options and the various Axios configs.
 */
export interface AgentSettings {
  options: AgentOptions;
  agentConfig: AxiosRequestConfig;
  uploadConfig: AxiosRequestConfig;
  downloadConfig: AxiosRequestConfig;
};

/**
 * The possible return value for the `onGetValidToken` callback.
 * Can be a headers object (e.g. `{ Authorization: 'Bearer ...' }`), `null`, `false`, or `undefined`.
 */
export type ValidTokenResponse = AxiosRequestConfig['headers'] | null | false | undefined;

/**
 * Configuration for pagination support (Content-Range header parsing).
 */
export interface PaginationConfig {
  /**
   * Default number of items per page when the limit cannot be determined from the request.
   * @default 100
   */
  defaultPageLimit?: number;
  /**
   * Name of the response header that contains the content range (e.g. `"Content-Range"`).
   */
  header?: string;
}

/**
 * Request interceptor signature used by the underlying Axios instance.
 */
export type RequestInterceptor = (config: AxiosRequestConfig) => AxiosRequestConfig;

/**
 * Response interceptor for successful responses.
 */
export type SuccessResponseInterceptor = (res: AxiosResponse) => AxiosResponse;

/**
 * Response interceptor for error responses. Should usually re-throw.
 */
export type ErrorResponseInterceptor = (err: AxiosError) => void ;

export type AgentOptions = {
  /**
   * A `QueryCache` instance to use for this agent.
   * Pass `createQueryCache()` (or a shared instance) to enable caching, SSR prefetching
   * (via dehydrate/hydrate), and cache-backed GETs.
   *
   * This is the recommended way to enable the cache layer.
   */
  queryCache?: QueryCache;
  /**
   * Default headers to include on every request made by this agent.
   */
  headers?: AxiosRequestConfig['headers'];
  /**
   * Indicates whether cross-site Access-Control requests should be made using credentials.
   * @default false
   */
  withCredentials?: boolean;
  /**
   * Enables pagination parsing from the `Content-Range` (or custom) response header.
   * Can be a boolean (uses defaults) or a `PaginationConfig` object.
   */
  pagination?: boolean | PaginationConfig;
  /**
   * URLs or patterns to exclude from request interception (token injection, etc.).
   * Strings are matched exactly; RegExp values are tested against the URL.
   */
  exclude?: string | RegExp | (string | RegExp)[];
  /**
   * Function invoked before requests to obtain authorization headers (e.g. a fresh token).
   * If it returns a falsy value the request is aborted (with a short-lived signal).
   */
  onGetValidToken?: () => ValidTokenResponse | Promise<ValidTokenResponse>;
  /**
   * Callback invoked when the server responds with 401 or 403.
   */
  onUnauthorizedResponse?: () => void | Promise<void>;
};

/**
 * Server-rendering semantics for GET requests via `agent.get`.
 *
 * - `auto` (default): cacheable GETs register as static-safe dependencies on the SSR tracker.
 * - `static`: explicitly static-safe; participates in page fingerprinting.
 * - `dynamic`: forces the current page render to be treated as dynamic.
 * - `no-store`: dynamic and excluded from persisted SSR cache snapshots.
 */
export type ApiSSRMode = 'auto' | 'static' | 'dynamic' | 'no-store';

export type QueryOptions = AxiosRequestConfig & {
  /**
   * Projects the response data returned by this `agent.get` call.
   *
   * The shared query cache keeps the raw response data. `select` only changes the
   * `response.data` value returned to this caller, and wraps `response.onData(...)`
   * so later cache updates are projected with the same function.
   *
   * @example
   * ```ts
   * const users = await agent.get('/api/users', {
   *   queryKey: ['users'],
   *   select: data => data.items,
   * });
   * ```
   */
  select?: (data: any, response: QueryResponse<any>) => any;
  /**
   * Requests TOON responses for this GET by adding `text/toon` to the `Accept` header.
   *
   * When the server responds with a `content-type` containing `text/toon`, the success
   * interceptor decodes the TOON payload with `@toon-format/toon` and assigns the parsed
   * JavaScript value to `response.data`.
   */
  toon?: boolean;
  /**
   * Optional query key for cache identification.
   *
   * - `unknown[]` (recommended structured form): serialized via JSON.stringify and used
   *   as the cache/storage key (instead of the raw URL). Good for TanStack-like semantics,
   *   targeted invalidation, and sharing across SSR/client.
   * - `string`: serialized via String() and used as the cache key. Kept for compatibility
   *   with older call sites.
   * - omitted: the full request URL (path + query string) is used as the cache key.
   *
   * When using `useQuery`, you typically pass the same `queryKey` value both at the
   * config level and inside the `fn` that calls `agent.get(...)`.
   */
  queryKey?: string | unknown[];
  /**
   * Optional expiration duration for the cached response (e.g. `'5m'`, `'1h30m'`, `'30s'`).
   * When a `queryCache` is provided on the agent, the cache entry becomes invalid after this time.
   * Uses `isDateYoungerOf` for the time comparison.
   *
   * Passing this (or `queryKey`) without a `queryCache` on the agent will log a console.error
   * (see `agent.get` / `getMethod`).
   */
  expireIn?: string;
  /**
   * Controls automatic cache refresh when an entry expires. Replaces the former `callOnExpired` option.
   *
   * - `true`: Passive mode. No timer is scheduled. The next `agent.get` for the same key (via `useQuery`
   *   refetch, source change, or manual `fetch()`) performs a network request only if the entry is expired.
   * - `string`: Active mode. A duration string (e.g. `'5m'`, `'1s'`). After a successful fetch the cache
   *   schedules a timer that polls at that interval and re-fetches when `expireIn` is exceeded.
   *
   * Requires `expireIn` for meaningful expiration. Only has effect when a `queryCache` is enabled.
   */
  fetchOnExpired?: true | string;
  /**
   * Controls automatic refetch after `invalidateQuery` marks an entry invalid.
   *
   * - `true`: Immediately re-fetches via the stored recall function.
   * - `string`: Waits the given duration (e.g. `'2s'`) before re-fetching.
   *
   * Only has effect when a `queryCache` is enabled.
   */
  fetchOnInvalidate?: true | string;
  /**
   * When `true`, removes the cache entry (instead of re-fetching) once `expireIn` is exceeded.
   * A polling timer is scheduled using `expireIn` as the interval.
   */
  removeOnExpired?: boolean;
  /**
   * When `true`, removes the cache entry immediately when it is invalidated via `invalidateQuery`.
   */
  removeOnInvalidate?: boolean;
  /**
   * Server-rendering mode for hybrid static/dynamic pages. Reports to the active
   * {@link SSRTracker} when one is installed (via `runSSRCycle` / SSR router).
   *
   * Separate from `expireIn` (query-cache TTL) and page-level revalidation manifests.
   *
   * @default 'auto'
   */
  ssrMode?: ApiSSRMode;
  /**
   * Suggested revalidation interval for static page manifests in SSR router.
   *
   * - `string`: duration string converted with `stringToMs` (for example `'5m'`, `'1h'`, `'30s'`).
   * - `false`: disables time-based revalidation for this dependency.
   *
   * Stored on the SSR tracker dependency entry as milliseconds (or `false`);
   * does not affect query-cache TTL directly.
   */
  ssrRevalitate?: string | false;
};

/**
 * The response object returned by cached (or plain) `agent.get` calls.
 * Extends AxiosResponse and adds pagination + reactive `onData` subscription.
 */
export type QueryResponse<T = any> = AxiosResponse<T> & {
  /** Pagination metadata parsed from a Content-Range style header (when pagination is enabled). */
  pagination?: Pagination<any>['pagination'];
  /**
   * Register a callback that will be invoked (via WeakRef) whenever fresh data for this
   * cache entry is written. Used internally by `useQuery` to keep reactive state in sync.
   */
  onData: (fn: (data: T) => void) => void;
};

export type MutationOptions = AxiosRequestConfig & {
  /**
   * Called after a successful mutation (POST/PUT/PATCH/DELETE).
   * Receives the agent's cache (if any) so you can call `invalidateQuery` etc.
   * Prefer keeping a reference to the `queryCache` you passed to the agent.
   */
  onSuccess?: (cache: QueryCache) => void;
  /** Called when the mutation throws. */
  onError?: (error: unknown) => void;
};

/**
 * The object returned by `createApiAgent()`.
 * It wraps an Axios instance with convenience methods, pagination helpers,
 * auth interceptors, and SSR prefetch collection support (via the `queryCache` you provide).
 */
export interface Agent {
  /** The raw Axios instance (you can use it directly if needed). */
  agent: AxiosInstance;
  /** Current default request config (headers, withCredentials, ...). */
  agentConfig: AxiosRequestConfig;
  /** Config used for `download()` calls (responseType: 'blob' + other merged settings). */
  downloadConfig: AxiosRequestConfig;
  /** Config used for `upload()` calls (multipart/form-data header). */
  uploadConfig: AxiosRequestConfig;

  /** Replace the agent's options (headers, credentials, pagination, callbacks, etc.). */
  setAgentOptions: (options: AgentOptions) => void;
  /** Deep-merge additional Axios request config into the agent's defaults. */
  mergeAgentConfig: (newSettings: AxiosRequestConfig) => void;

  /** Resolve a page number into a limit using current/default pagination config. */
  getPageLimit: (limit?: PageLimit) => number;
  /** Resolve a page number (string/number/null) to a number (defaults to 1). */
  getPageNumber: (page?: PageNumber) => number;
  /** Convert (page, limit) into an offset suitable for offset-based APIs. */
  pageToOffset: (page?: PageNumber, limit?: PageLimit) => number;

  /**
   * Download helper. Performs a GET and triggers a browser file download.
   * The blob is created via `URL.createObjectURL`.
   */
  download: <T = any>(url: string, fileName: string, config?: AxiosRequestConfig & { domElement?: HTMLElement }) => Promise<AxiosResponse<T>>;

  /** DELETE request (optionally participates in cache onSuccess/onError). */
  delete: <T = any>(url: string, options?: MutationOptions) => Promise<AxiosResponse<T>>;
  /**
   * GET request. When the agent was created with a `queryCache`, this goes through the
   * cache layer.
   *
   * Using `queryKey` or `expireIn` in options without `queryCache` on the agent will
   * trigger a `console.error`.
   */
  get: <T = any>(url: string, options?: QueryOptions) => Promise<QueryResponse<T>>;
  /** PATCH request. */
  patch: <T = any>(url: string, data?: unknown, options?: MutationOptions) => Promise<AxiosResponse<T>>;
  /** POST request. */
  post: <T = any>(url: string, data?: unknown, options?: MutationOptions) => Promise<AxiosResponse<T>>;
  /** PUT request. */
  put: <T = any>(url: string, data?: unknown, options?: MutationOptions) => Promise<AxiosResponse<T>>;
  /** Upload helper (multipart POST). */
  upload: <T = any>(url: string, data: FormData, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
};

/**
 * Parsed representation of a `Content-Range` style header (`start-end/total`).
 */
export type ParsedContentRange = {
  start: number;
  end: number;
  total: number;
};

/** Accepted input for page-related helpers (string for flexibility from query params, null treated as 1 or 0 depending on context). */
export type PageNumber = number | string | null;
/** Accepted input for limit-related helpers. */
export type PageLimit = number | string | null;

/**
 * Axios response augmented with a `pagination` object when the agent has pagination enabled
 * and the server sent a recognizable `Content-Range` header.
 */
export type Pagination<T> = AxiosResponse<T[]> & {
  pagination: {
    /** First item index (0-based) in the current page. */
    start: number;
    /** Last item index (inclusive) in the current page. */
    end: number;
    /** Total number of items available on the server. */
    total: number;
    /** Page size used for this response. */
    size: number;
    /** Current page number (1-based). */
    current: number;
    /** Total number of pages (`Math.ceil(total / size)`). */
    of: number;
  };
};
