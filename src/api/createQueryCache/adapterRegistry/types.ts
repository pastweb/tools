/** A cache participant exposed by an API agent. */
export interface QueryCacheAdapter {
  /** Stable, application-wide identity used to match server and browser state. */
  readonly key: string;
  dehydrate(): Promise<unknown>;
  hydrate(snapshot: unknown): void;
  invalidate(queryKey?: unknown): void;
  resetForSSR(): void;
}

/** Agent shape accepted by the shared cache without importing a transport. */
export interface CacheAgent {
  readonly gql?: QueryCacheAdapter;
}
