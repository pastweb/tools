import type { GraphQLEntry, GraphQLResponse, UrqlAdapterState } from '../types';

/**
 * Executes an operation through urql and exposes a disposable live result stream.
 * @example
 * ```ts
 * const result = await executeEntry(state, entry, true);
 * ```
 */
export async function executeEntry(state: UrqlAdapterState, entry: GraphQLEntry, networkOnly = false): Promise<GraphQLResponse> {
  const context = await entry.context();
  const source = state.client.executeQuery(entry.request, { ...context, ...(networkOnly ? { requestPolicy: 'network-only' as const } : {}) });
  const result = await source.toPromise();
  entry.invalid = false;
  if (networkOnly || !entry.timestamp || result.operation.context.meta?.cacheOutcome === 'miss') entry.timestamp = Date.now();
  return {
    ...result,
    onResult(callback) {
      const updates = state.client.executeQuery(entry.request, { ...context, requestPolicy: 'cache-first' });
      const subscription = updates.subscribe(result => {
        if (!result.stale && result.operation.context.meta?.cacheOutcome === 'miss') entry.timestamp = Date.now();
        callback(result);
      });
      const dispose = () => { subscription.unsubscribe(); state.subscriptions.delete(dispose); };
      state.subscriptions.add(dispose);
      return dispose;
    },
  };
}
