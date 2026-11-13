import type { Pagination } from '../createApiAgent/types';

/** Common result fields consumed by hooks without requiring a particular transport. */
export interface ApiResult<T> {
  data?: T;
  error?: unknown;
  extensions?: Record<string, unknown>;
  status?: number;
  pagination?: Pagination<any>['pagination'];
  onData?: (callback: (data: T) => void) => void;
  onResult?: (callback: (result: ApiResult<T>) => void) => () => void;
}
