import type { RetryOption } from '../types';

const DEFAULT_RETRY_COUNT = 3;

export function shouldRetry(retry: RetryOption | undefined, failureCount: number, error: unknown): boolean {
  if (!retry) return false;
  if (typeof retry === 'function') return retry(failureCount, error);
  if (retry === true) return failureCount <= DEFAULT_RETRY_COUNT;

  return failureCount <= retry;
}
