import { createOperation } from './createOperation';
import { getOperationContext } from './getOperationContext';
import type { AnyVariables, DocumentInput, OperationResult } from '@urql/core';
import type { AgentSettings } from '../../createApiAgent/types';
import type { GraphQLMutationOptions, GraphQLResponse, UrqlAdapterState } from '../types';

/**
 * Executes mutations explicitly and preserves urql returned errors and partial data.
 * @example
 * ```ts
 * await mutation(state, document, { variables: { id: '1' } }, settings);
 * ```
 */
export async function mutation<Data, Variables extends AnyVariables>(state: UrqlAdapterState, document: DocumentInput<Data, Variables>, options: GraphQLMutationOptions<Variables>, settings: AgentSettings): Promise<GraphQLResponse<Data, Variables>> {
  let result: OperationResult<Data, Variables>;
  try {
    const request = createOperation(options.context?.url ?? state.endpoint, document, (options.variables ?? {}) as Variables);
    const defaults = state.client.createRequestOperation('mutation', request).context;
    const context = await getOperationContext(settings, state.endpoint, options.context, defaults.fetchOptions, defaults.fetch);
    result = await state.client.executeMutation(request, context).toPromise();
  } catch (error) {
    await options.onError?.(error);
    throw error;
  }
  if (result.error) await options.onError?.(result.error, result);
  else await options.onSuccess?.(settings.options.queryCache, result);
  return result;
}
