import type { CacheAgent, QueryCacheAdapter } from './types';

/**
 * Coordinates independently owned caches and retains hydration until agents register.
 * @example
 * ```ts
 * const registry = createAdapterRegistry();
 * registry.registerAgent(api);
 * ```
 */
export function createAdapterRegistry() {
  const adapters = new Map<string, QueryCacheAdapter>();
  const pending = new Map<string, unknown>();
  
  return {
    registerAgent(agent: CacheAgent) {
      const adapter = agent.gql;
      
      if (!adapter) return;
      
      const previous = adapters.get(adapter.key);
      
      if (previous && previous !== adapter) throw new Error(`Duplicate GraphQL adapter key: ${adapter.key}. Supply a unique key for each client.`);
      
      adapters.set(adapter.key, adapter);
      
      if (pending.has(adapter.key)) {
        adapter.hydrate(pending.get(adapter.key));
        pending.delete(adapter.key);
      }
    },
    invalidate(key?: unknown) { for (const adapter of adapters.values()) adapter.invalidate(key); },
    async dehydrate() {
      const snapshots = await Promise.all([...adapters].map(async ([key, adapter]) => [key, await adapter.dehydrate()] as const));
      return Object.fromEntries(snapshots);
    },
    hydrate(snapshots: Record<string, unknown>) {
      for (const [key, snapshot] of Object.entries(snapshots)) {
        const adapter = adapters.get(key);
        if (adapter) adapter.hydrate(snapshot);
        else pending.set(key, snapshot);
      }
    },
    resetForSSR() {
      pending.clear();
      for (const adapter of adapters.values()) adapter.resetForSSR();
    },
  };
}
