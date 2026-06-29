import { stringToMs } from '../../../stringToMs';
import type { RetryDelayOption } from '../types';

export function getRetryDelay(retryDelay: RetryDelayOption | undefined, failureCount: number, error: unknown): number {
  if (typeof retryDelay === 'function') return retryDelay(failureCount, error);
  if (typeof retryDelay === 'string') return stringToMs(retryDelay);
  if (typeof retryDelay === 'number') return retryDelay;

  return 0;
}
