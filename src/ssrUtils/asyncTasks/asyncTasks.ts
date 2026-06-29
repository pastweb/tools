import { isServer } from '../../envs';

/**
 * Internal queue holding functions that represent async work to be performed
 * on the server (SSR). This is typically populated by components or utilities
 * during the initial render pass so that the work can be awaited later
 * (e.g. to collect data from nested asynchronous components).
 *
 * You normally should not interact with this array directly. Use
 * `registerAsyncTask` to add work and `resolveAsyncTasks` to execute it.
 */
export const TASKS: Array<() => Promise<any>> = [];

/**
 * Registers an asynchronous task that should be executed later on the server.
 *
 * The task is only added when running on the server (`isServer` is true).
 * Registered tasks are collected during the initial render phase and can be
 * executed afterwards using `resolveAsyncTasks`. This pattern allows work
 * from asynchronously loaded components (including nested ones) to be
 * discovered without blocking the synchronous render.
 *
 * @param fn - A function returning a Promise that performs the async work.
 *
 * @example
 * ```ts
 * registerAsyncTask(async () => {
 *   const data = await fetchData();
 *   // store data or trigger side effects
 * });
 * ```
 */
export function registerAsyncTask(fn: () => Promise<any>): void {
  if (isServer) TASKS.push(fn);
}

/**
 * Executes all currently registered async tasks.
 *
 * Tasks are processed iteratively: if a task registers new tasks while
 * executing (common with nested async components), those new tasks will
 * also be picked up and executed in subsequent iterations of the loop.
 *
 * Individual task errors are caught, logged to the console, and do not
 * prevent other tasks from running. After successful execution the internal
 * queue is cleared.
 *
 * @returns A promise that resolves when all tasks (including any that were
 *          registered during execution) have completed.
 *
 * @example
 * ```ts
 * // After the initial render / collection pass
 * await pageRender({ router });
 *
 * // Run everything that was registered
 * await resolveAsyncTasks();
 * ```
 */
export async function resolveAsyncTasks(): Promise<void> {
  // Iterative resolution so nested async components are discovered
  while (true) {
    const current = TASKS.splice(0);   // take everything registered so far
    if (current.length === 0) break;

    await Promise.all(
      current.map(async (task) => {
        try {
          await task();
        } catch (e) {
          console.error('[SSR] async task failed', e);
        }
      })
    );
    // any new registrations that happened while we were running tasks
    // will be picked up in the next iteration of the while
  }
}
