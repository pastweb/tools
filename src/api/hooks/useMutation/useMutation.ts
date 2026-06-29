import { noop } from '../../../noop';
import { reactive } from '../../../reactivity';
import { runWithRetry } from '../utils';
import type { MutationConfig, MutationInfo } from './types';

/**
 * Creates a reactive mutation object.
 *
 * Lifecycle:
 * 1. `onMutate(...args)` is awaited.
 * 2. `isPending`/`isMutating` become true, error cleared.
 * 3. `fn(...args)` is called.
 * 4. On success: data is updated, `isPlaceholderData` cleared.
 * 5. On error: `isError` + `error` are set and `onError` is awaited.
 * 6. `finally`: pending flags cleared and `onSuccess` is always awaited.
 *
 * @param config - Mutation configuration.
 * @returns Reactive `MutationInfo` with a `mutate` method.
 *
 * @example
 * ```ts
 * const mutation = useMutation({
 *   fn: payload => agent.post('/api/users', payload),
 *   retry: 2,
 *   retryDelay: 500,
 * });
 * ```
 */
export function useMutation<T>(config: MutationConfig<T>): MutationInfo<T> {
  const { fn, onMutate = noop, onSuccess = noop, onError = noop, initialData = null, retry, retryDelay } = config;
  const mutation = reactive<MutationInfo<T>>({
    data: initialData,
    isPending: false,
    isMutating: false, // alias of isPending
    isError: false,
    error: null,
    isPlaceholderData: !!initialData,
    mutate,
  });

  /**
   * Executes the mutation. See `useMutation` for the full lifecycle description.
   */
  async function mutate(...args: any[]) {
    await onMutate(...args);
    mutation.isPending = true;
    mutation.isMutating = true;
    mutation.isError = false;
    mutation.error = null;

    try {
      const response = await runWithRetry(() => fn(...args), retry, retryDelay);
      mutation.isError = false;
      mutation.error = null;

      if (mutation.data !== response.data) {
        mutation.data = response.data;
        mutation.isPlaceholderData = false;
      }
    } catch (err) {
      mutation.isError = true;
      mutation.error = err;
      await onError(err);
    } finally {
      mutation.isPending = false;
      mutation.isMutating = false;
      await onSuccess(...args);
    }
  }

  return mutation;
}
