import { stringifyDocument, stringifyVariables } from '@urql/core';
import { isServer } from '../../../envs';
import { reportApiSSRToTracker } from '../../../ssrUtils/ssrTracker/reportApiSSR';
import { isEntryExpired } from '../../createQueryCache/utils/isEntryExpired';
import { createOperation } from './createOperation';
import { getOperationContext } from './getOperationContext';
import { executeEntry } from './executeEntry';
import type { AnyVariables, DocumentInput } from '@urql/core';
import type { Agent, AgentSettings } from '../../createApiAgent/types';
import type { GraphQLEntry, GraphQLQueryOptions, GraphQLResponse, UrqlAdapterState } from '../types';

/**
 * Registers GraphQL prefetches and delegates result caching to urql.
 * @example
 * ```ts
 * const result = await query(state, document, { page: 2 }, agent, settings);
 * ```
 */
export async function query<Data, Variables extends AnyVariables>(state: UrqlAdapterState, document: DocumentInput<Data, Variables>, options: GraphQLQueryOptions<Variables>, agent: Agent, settings: AgentSettings): Promise<GraphQLResponse<Data, Variables>> {
  const limit = agent.getPageLimit(options.limit);
  const variables = { ...(options.page !== undefined ? { offset: agent.pageToOffset(options.page, limit), limit } : {}), ...options.variables } as Variables;
  const endpoint = options.context?.url ?? state.endpoint;
  const defaults = state.client.createRequestOperation('query', createOperation(endpoint, document, variables)).context;
  const request = createOperation(endpoint, document, variables, defaults.url);
  const cacheKey = options.queryKey === undefined
    ? JSON.stringify(['gql', state.key, endpoint, stringifyDocument(request.query), stringifyVariables(variables)])
    : typeof options.queryKey === 'string' ? options.queryKey : JSON.stringify(options.queryKey);
  reportApiSSRToTracker(endpoint, { ...options, queryKey: ['gql', state.key, cacheKey] });
  const previous = state.entries.get(cacheKey);
  if (previous && previous.request.key !== request.key) throw new Error('GraphQL queryKey must distinguish documents, variables, and endpoints.');
  const restored = state.restored.get(cacheKey);
  const entry: GraphQLEntry = previous ?? {
    cacheKey, request, options, invalid: restored?.invalid ?? false, timestamp: restored?.timestamp ?? 0,
    context: async () => ({}), execute: async () => { throw new Error('Uninitialized GraphQL operation'); },
  };
  entry.options = options;
  entry.context = () => {
    const defaults = state.client.createRequestOperation('query', request).context;
    return getOperationContext(settings, state.endpoint, options.context, defaults.fetchOptions, defaults.fetch);
  };
  entry.execute = networkOnly => executeEntry(state, entry, networkOnly);
  state.entries.set(cacheKey, entry);
  if (isServer && settings.options.queryCache && !state.collected) {
    return { operation: state.client.createRequestOperation('query', request), stale: false, hasNext: false };
  }
  const expired = entry.timestamp > 0 && isEntryExpired(entry.timestamp, options.expireIn);
  return await entry.execute(entry.invalid || expired) as GraphQLResponse<Data, Variables>;
}
