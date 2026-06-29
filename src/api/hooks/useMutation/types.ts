import type { AxiosResponse } from 'axios';
import type { RetryDelayOption, RetryOption } from '../types';

/**
 * Configuration passed to `useMutation()`.
 */
export interface MutationConfig<T> {
  /** The mutation function (typically `agent.post`, `agent.put`, `agent.delete`, ...). */
  fn: (...args: any[]) => Promise<AxiosResponse<T>>;
  /** Value for `data` before the first successful mutation. */
  initialData?: T;
  /** Called before the mutation starts. Can be async. */
  onMutate?: (...args: any[]) => void | Promise<void>;
  /**
   * Called in the `finally` block after the mutation settles (success or error).
   * Receives the same arguments that were passed to `mutate()`.
   */
  onSuccess?: (...args: any[]) => void | Promise<void>;
  /** Called only on error (after setting `isError` / `error`). */
  onError?: (error: unknown) => void | Promise<void>;
  /**
   * Retry behavior for failed mutation executions.
   *
   * - `false` or omitted: do not retry.
   * - `true`: retry up to 3 times.
   * - `number`: retry up to that many times after the first failed attempt.
   * - function: receives the 1-based failure count and error; return `true` to retry.
   *
   * @example
 * ```ts
 * const saveUser = useMutation({
 *   fn: user => agent.post('/users', user),
 *   retry: (failureCount) => failureCount < 2,
 * });
 * ```
   */
  retry?: RetryOption;
  /**
   * Delay before retry attempts. Numbers are milliseconds, strings use `stringToMs`,
   * and functions receive the 1-based failure count and error.
   */
  retryDelay?: RetryDelayOption;
};

/**
 * The reactive object returned by `useMutation()`.
 */
export interface MutationInfo<T> {
  /** Response data from the last successful mutation (or `initialData`). */
  data: T | null;
  /** True while a mutation is in flight. */
  isPending: boolean;
  /** Alias for `isPending`. */
  isMutating: boolean;
  /** True if the last mutation rejected. */
  isError: boolean;
  /** Rejection reason of the last mutation (if any). */
  error: any;
  /** Whether `data` currently contains the `initialData`. */
  isPlaceholderData: boolean;
  /** Execute the mutation with the provided arguments. */
  mutate: (...args: any[]) => Promise<void>;
};
