import { noop } from '../noop';
import { reactive } from '../reactivity';
import type { MutationConfig, MutationInfo } from './types';

/**
 * Creates a reactive mutation that executes the provided function and updates based on dependencies.
 * @param config - Configuration object with mutation function and optional initial data.
 * @returns A reactive object with mutation state and mutate method.
 */
export function useMutation<T>(config: MutationConfig<T>): MutationInfo<T> {
  const { fn, onMutate = noop, onSuccess = noop, onError = noop, initialData = null } = config;
  const mutation = reactive<MutationInfo<T>>({
    data: initialData,
    isPending: false,
    isMutating: false, // alias of isPending
    isError: false,
    error: null,
    isPlaceholderData: !!initialData,
    mutate,
  });

  // Mutation logic
  async function mutate(...args: any[]) {
    await onMutate(...args);
    mutation.isPending = true;
    mutation.isMutating = true;
    mutation.isError = false;
    mutation.error = null;

    try {
      const response = await fn(...args);
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
