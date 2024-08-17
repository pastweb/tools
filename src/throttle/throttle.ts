import { ThrottleCallback } from './types';

/**
 * Returns a throttle function defined in the @param fn parameter,
 * executed for each @param timeout passed as second parameter.
 * The returnded throttle functio has 2 members:
 * @member cancel is a function to stop the function throttling;
 * @member flush is a function to flush the timeout.
 *
 * @remarks
 * This method is part of the {@link @pastweb/tools#throttle | throttle function}.
 *
 * @param fn - The function to run
 * @param timeout - The timeout gap in milliseconds 
 * @returns The throttle callback function
 *
 */

export function throttle(fn: ThrottleCallback, timeout = 300): ThrottleCallback {
  let timer: any;
  let inThrottle: boolean;
  let canceled = false;

  const unThrottle = () => {
    inThrottle = false;
  };

  function cancel() {
    if (timer !== undefined) {
      clearTimeout(timer);
      canceled = true;
    }
  }

  function throttled(...args: any[]) {
    if (inThrottle || canceled) return;

    fn.apply(this, args);
    inThrottle = true;

    timer = setTimeout(unThrottle, timeout);
  }

  function flush() {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    canceled = false;
    timer = setTimeout(unThrottle, timeout);
  }

  throttled.cancel = cancel;
  throttled.flush = flush;

  return throttled;
}
