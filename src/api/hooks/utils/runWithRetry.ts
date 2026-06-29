import { getRetryDelay } from './getRetryDelay';
import { shouldRetry } from './shouldRetry';
import { wait } from './wait';
import type { RetryDelayOption, RetryOption } from '../types';

export async function runWithRetry<T>(
  fn: () => Promise<T>,
  retry?: RetryOption,
  retryDelay?: RetryDelayOption,
): Promise<T> {
  let failureCount = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      failureCount += 1;

      if (!shouldRetry(retry, failureCount, error)) {
        throw error;
      }

      await wait(getRetryDelay(retryDelay, failureCount, error));
    }
  }
}
