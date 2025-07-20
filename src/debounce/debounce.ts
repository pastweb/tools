import type { DebouceCallback } from './types';

/**
 * Creates a debounced function that delays invoking `fn` until after `timeout` milliseconds have elapsed since the last time the debounced function was invoked. The debounced function has methods `cancel` and `flush` to cancel delayed invocation and to immediately invoke them respectively.
 *
 * @param fn - The function to debounce.
 * @param timeout - The number of milliseconds to delay; default is 300 milliseconds.
 * @returns A debounced function with `cancel` and `flush` methods.
 *
 * @example
 * ```typescript
 * import { debounce } from './debounce';
 *
 * const debouncedLog = debounce((msg: string) => console.log(msg), 500);
 *
 * debouncedLog('Hello');  // Will log 'Hello' after 500 milliseconds if not called again within this time.
 * debouncedLog.cancel();  // Cancels the delayed invocation.
 * debouncedLog.flush();   // Immediately invokes the delayed function.
 * ```
 */
export function debounce(fn: DebouceCallback, timeout = 300): DebouceCallback {
  let timer: any;
  let toCall: () => void;
  let canceled = false;

  /**
   * Cancels the delayed invocation if it is still pending.
   */
  function cancel() {
    if (!timer) {
      clearTimeout(timer);
      canceled = true;
    }
  }

  /**
   * The debounced function.
   *
   * @param args - The arguments to pass to the original function.
   */
  function debouced(...args: any[]) {
    clearTimeout(timer);
    toCall = () => fn.apply(this, args);
    
    if (!canceled) {
      timer = setTimeout(toCall, timeout);
    }
  };

  /**
   * Immediately invokes the delayed function if it is still pending.
   */
  function flush() {
    if (!timer) {
      clearTimeout(timer);
    }
    canceled = false;
    clearTimeout(timer);
    timer = setTimeout(toCall, timeout);
  }

  debouced.cancel = cancel;
  debouced.flush = flush;

  return debouced;
}
