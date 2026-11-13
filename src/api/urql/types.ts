import type { AnyVariables, Client, ClientOptions, DocumentInput, GraphQLRequest, OperationContext, OperationResult, OperationResultSource, SSRExchange } from '@urql/core';
import type { Agent, AgentSettings, ApiSSRMode, PageLimit, PageNumber, QueryKey } from '../createApiAgent/types';
import type { QueryCache } from '../createQueryCache/types';
import type { QueryCacheAdapter } from '../createQueryCache/adapterRegistry';

/** Optional GraphQL inputs and Pastweb query lifecycle options. */
export interface GraphQLQueryOptions<Variables extends AnyVariables = AnyVariables> {
  variables?: Partial<Variables>;
  page?: PageNumber;
  limit?: PageLimit;
  queryKey?: QueryKey;
  context?: Partial<OperationContext>;
  ssrMode?: ApiSSRMode;
  ssrRevalitate?: string | false;
  expireIn?: string;
  fetchOnInvalidate?: true | string;
}

/** Explicit mutation inputs. Returned GraphQL errors do not reject the promise. */
export interface GraphQLMutationOptions<Variables extends AnyVariables = AnyVariables> {
  variables?: Variables;
  context?: Partial<OperationContext>;
  onSuccess?: (cache: QueryCache | undefined, result: OperationResult<any, Variables>) => void | Promise<void>;
  onError?: (error: unknown, result?: OperationResult<any, Variables>) => void | Promise<void>;
}

/** urql result with an optional live subscription for Pastweb hooks. */
export type GraphQLResponse<Data = any, Variables extends AnyVariables = AnyVariables> = OperationResult<Data, Variables> & {
  onResult?: (callback: (result: OperationResult<Data, Variables>) => void) => () => void;
};

/** A client and its matching SSR exchange, returned by a custom client factory. */
export interface UrqlAdapterOptions {
  /** Defaults to the endpoint. Required to distinguish clients sharing an endpoint. */
  key?: string;
  /** Optional override when a client/factory already supplies its URL. */
  endpoint?: string;
  /** Additional options for the default client (uses cache → SSR → fetch exchanges). */
  clientOptions?: Omit<ClientOptions, 'url' | 'exchanges'>;
  /** Advanced client factory; install the supplied SSR exchange between cache and fetch. Called again for every SSR reset. */
  createClient?: (ssr: SSRExchange) => Client;
  /** Existing client. Supply its matching SSR exchange for hydration. */
  urql?: Client;
  ssr?: SSRExchange;
}

/** Exposes the urql client and delegates transport-specific cache work to it. */
export interface UrqlAdapter extends QueryCacheAdapter {
  readonly urql: Client;
  readonly endpoint: string;
  query<Data = any, Variables extends AnyVariables = AnyVariables>(document: DocumentInput<Data, Variables>, options: GraphQLQueryOptions<Variables>, agent: Agent, settings: AgentSettings): Promise<GraphQLResponse<Data, Variables>>;
  mutation<Data = any, Variables extends AnyVariables = AnyVariables>(document: DocumentInput<Data, Variables>, options: GraphQLMutationOptions<Variables>, settings: AgentSettings): Promise<GraphQLResponse<Data, Variables>>;
  extractData(): unknown;
  restoreData(snapshot: unknown): void;
}

/** Internal operation registration; urql owns result storage. */
export interface GraphQLEntry {
  cacheKey: string;
  request: GraphQLRequest;
  options: GraphQLQueryOptions;
  invalid: boolean;
  timestamp: number;
  timer?: ReturnType<typeof setTimeout>;
  context: () => Promise<Partial<OperationContext>>;
  execute: (networkOnly?: boolean) => Promise<GraphQLResponse>;
}

/** Internal adapter state, replaced at SSR request boundaries. */
export interface UrqlAdapterState {
  client: Client;
  ssr?: SSRExchange;
  endpoint: string;
  key: string;
  entries: Map<string, GraphQLEntry>;
  subscriptions: Set<() => void>;
  collected: boolean;
  restored: Map<string, { timestamp: number; invalid: boolean }>;
}

export type GraphQLSource = OperationResultSource<OperationResult>;
