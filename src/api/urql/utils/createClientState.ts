import { Client, cacheExchange, createRequest, fetchExchange, ssrExchange } from '@urql/core';
import { isServer } from '../../../envs';
import type { UrqlAdapterOptions, UrqlAdapterState } from '../types';

/**
 * Creates an isolated client and SSR exchange for one adapter lifecycle.
 * @example
 * ```ts
 * const state = createClientState({ endpoint: '/graphql' });
 * ```
 */
export function createClientState(options: UrqlAdapterOptions): UrqlAdapterState {
  if (options.urql && options.createClient) throw new Error('Supply urql or createClient, not both.');
  const ssr = options.urql ? options.ssr : ssrExchange({ isClient: !isServer, includeExtensions: true });
  const client = options.urql ?? options.createClient?.(ssr!) ?? new Client({
    ...options.clientOptions,
    url: options.endpoint ?? '/graphql',
    exchanges: [cacheExchange, ssr!, fetchExchange],
  });
  const endpoint = options.endpoint ?? client.createRequestOperation('query', createRequest('{ __typename }', {})).context.url;
  return { client, ssr, endpoint, key: options.key ?? endpoint, entries: new Map(), subscriptions: new Set(), collected: false, restored: new Map() };
}
