import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { Computed, Reactive, Ref } from '../reactivity';

export type ValidTokenResponse = AxiosRequestConfig['headers'] | null | false | undefined;

export interface PaginationConfig {
  defaultPageLimit?: number;
  header?: string;
}

export type AgentOptions = {
  /**
   * Enables caching of responses similar to React Query.
   * @default false
   */
  cache?: boolean;
  /**
   * Custom headers to be sent with each request.
   */ 
  headers?: AxiosRequestConfig['headers'];
  /**
   * Indicates whether cross-site Access-Control requests should be made using credentials.
   * @default false
   */
  withCredentials?: boolean;
  pagination?: boolean | PaginationConfig;
  /**
   * URLs or patterns to exclude from request interception.
   */
  exclude?: string | RegExp | (string | RegExp)[];
  /**
   * Function to retrieve a valid token for authorization.
   */
  onGetValidToken?: () => ValidTokenResponse | Promise<ValidTokenResponse>;
  /**
   * Callback for handling unauthorized responses (401 or 403 status codes).
   */
  onUnauthorizedResponse?: () => void | Promise<void>;
}

export type RequestInterceptor = (config: AxiosRequestConfig) => AxiosRequestConfig;

export type SuccessResponseInterceptor = (res: AxiosResponse) => AxiosResponse;

export type ErrorResponseInterceptor = (err: AxiosError) => void ;

export type QueryOptions = AxiosRequestConfig & {
  queryKey?: string;
  expireIn?: string;
};

export type QueryResponse<T = any> = AxiosResponse<T> & {
  pagination?: Pagination<any>['pagination'];
  onData: (fn: (data: T) => void) => void;
};

export interface QueryData {
  invalid: boolean;
  response: AxiosResponse;
  timestamp: number;
  expireIn: string;
  onDataCallbacks: Set<WeakRef<Function>>;
};

export interface QueryCache {
  get: (key: string) => QueryData | undefined;
  getAll: () => [string, QueryData][];
  has: (key: string) => boolean;
  delete: (key: string) => boolean;
  set: (key: string, data: QueryData) => Map<string, QueryData>;
  invalidateQuery: (queryKey?: string | string[]) => void;
};

export type MutationOptions = AxiosRequestConfig & {
  onSuccess?: (cache: QueryCache) => void;
  onError?: (error: unknown) => void;
};

export interface Agent {
  agent: AxiosInstance;
  agentConfig: AxiosRequestConfig;
  cache: QueryCache,
  downloadConfig: AxiosRequestConfig;
  uploadConfig: AxiosRequestConfig;
  setAgentOptions: (options: AgentOptions) => void;
  mergeAgentConfig: (newSettings: AxiosRequestConfig) => void;
  getPageLimit: (limit?: PageLimit) => number;
  getPageNumber: (page?: PageNumber) => number;
  pageToOffset: (page?: PageNumber, limit?: PageLimit) => number;
  download: <T = any>(url: string, fileName: string, config?: AxiosRequestConfig & { domElement?: HTMLElement }) => Promise<AxiosResponse<T>>;
  delete: <T = any>(url: string, options?: MutationOptions) => Promise<AxiosResponse<T>>;
  get: <T = any>(url: string, options?: QueryOptions) => Promise<QueryResponse<T>>;
  patch: <T = any>(url: string, data?: unknown, options?: MutationOptions) => Promise<AxiosResponse<T>>;
  post: <T = any>(url: string, data?: unknown, options?: MutationOptions) => Promise<AxiosResponse<T>>;
  put: <T = any>(url: string, data?: unknown, options?: MutationOptions) => Promise<AxiosResponse<T>>;
  upload: <T = any>(url: string, data: FormData, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
};

export type ParsedContentRange = {
  start: number;
  end: number;
  total: number;
};

export type PageNumber = number | string | null;
export type PageLimit = number | string | null;

export type Pagination<T> = AxiosResponse<T[]> & {
  pagination: {
    start: number;
    end: number;
    total: number;
    size: number;
    current: number;
    of: number;
  };
};

/**
 * Configuration object for the createQuery function.
 */
export interface QueryConfig<T> {
  fn: () => Promise<QueryResponse<T>>; // Function returning a Promise from agent.get
  source?: (() => any) | Ref<any> | Reactive<any> | Computed<any> | Array<(() => any) | Ref<any> | Reactive<any> | Computed<any>>, // necessary if immediate is false
  immediate?: boolean | Ref<boolean>; // Run query immediately
  initialData?: T; // Optional initial data
  SSRWait?: boolean; // If true, the query will block rendering on the server until it completes (SSR only)
};

/**
 * Reactive query information object.
 */
export interface QueryInfo<T> {
  isPending: boolean; // True during initial fetch or refetch
  isLoading: boolean; // Alias for isPending
  isFetching: boolean; // True during any fetch
  isError: boolean; // True if an error occurred
  data: T | null; // Response data or initialData
  pagination: Pagination<any>['pagination'] | null; // Pagination info if available
  error: any; // Error object
  isPlaceholderData: boolean; // True if data is initialData
  fetch: () => Promise<void>; // Manual fetch function
};

/**
 * Configuration object for the createMutation function.
 */
export interface MutationConfig<T> {
  fn: (...args: any[]) => Promise<AxiosResponse<T>>; // Mutation function (e.g., agent.post)
  initialData?: T; // Optional initial data
  onMutate?: (...args: any[]) => void | Promise<void>;
  onSuccess?: (...args: any[]) => void | Promise<void>;
  onError?: (error: unknown) => void | Promise<void>;
};

/**
 * Reactive mutation information object.
 */
export interface MutationInfo<T> {
  data: T | null; // Response data or initialData
  isPending: boolean; // True during mutation
  isMutating: boolean; // True during mutation (alias for isPending)
  isError: boolean; // True if an error occurred
  error: any; // Error object
  isPlaceholderData: boolean; // True if data is initialData
  mutate: (...args: any[]) => Promise<void>; // Execute the mutation
}
