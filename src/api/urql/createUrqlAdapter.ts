import { isServer } from '../../envs';
import { stringToMs } from '../../stringToMs';
import { createClientState } from './utils/createClientState';
import { extractData } from './utils/extractData';
import { matchesQueryKey } from './utils/matchesQueryKey';
import { mutation } from './utils/mutation';
import { query } from './utils/query';
import type { SSRData } from '@urql/core';
import type { UrqlAdapter, UrqlAdapterOptions } from './types';

/**
 * Creates an optional urql integration with isolated caching and SSR state.
 * Import from `@pastweb/tools/api/urql` so REST consumers do not load urql.
 * @example
 * ```ts
 * const gql = createUrqlAdapter({ endpoint: '/graphql', key: 'catalog' });
 * const api = createApiAgent({ queryCache, gql });
 * ```
 */
export function createUrqlAdapter(options: UrqlAdapterOptions = {}): UrqlAdapter {
  let state = createClientState(options);
  
  const adapter: UrqlAdapter = {
    get key() { return state.key; },
    get urql() { return state.client; },
    get endpoint() { return state.endpoint; },
    query: (document, options, agent, settings) => query(state, document, options, agent, settings),
    mutation: (document, options, settings) => mutation(state, document, options, settings),
    extractData: () => extractData(state),
    restoreData(snapshot) {
      if (!snapshot || typeof snapshot !== 'object') return;
      
      const data = snapshot as { operations?: SSRData; entries?: Record<string, { timestamp: number; invalid: boolean }> };
      state.ssr?.restoreData(data.operations ?? {});
      
      for (const [key, entry] of Object.entries(data.entries ?? {})) state.restored.set(key, entry);
      
      if (isServer) state.collected = true;
    },
    async dehydrate() {
      if (!state.ssr && state.entries.size) throw new Error('GraphQL SSR requires an adapter SSR exchange. Use createUrqlAdapter with createClient.');
      if (!state.collected) await Promise.all([...state.entries.values()].map(entry => entry.execute(entry.invalid)));
      
      state.collected = true;
      
      return adapter.extractData();
    },
    hydrate: snapshot => adapter.restoreData(snapshot),
    invalidate(key) {
      for (const entry of state.entries.values()) {
        if (!matchesQueryKey(entry.cacheKey, key)) continue;
      
        entry.invalid = true;
        if (entry.timer) clearTimeout(entry.timer);
      
        if (entry.options.fetchOnInvalidate) {
          const delay = typeof entry.options.fetchOnInvalidate === 'string' ? stringToMs(entry.options.fetchOnInvalidate) : 0;
          entry.timer = setTimeout(() => { void entry.execute(true).catch(() => { entry.invalid = true; }); }, delay);
        }
      }
    },
    resetForSSR() {
      if (options.urql) throw new Error('SSR reset requires a fresh urql client. Supply createClient instead of a shared urql instance.');
      for (const dispose of state.subscriptions) dispose();
      for (const entry of state.entries.values()) if (entry.timer) clearTimeout(entry.timer);
      const fresh = createClientState(options);
      if (fresh.client === state.client) throw new Error('createClient must return a fresh urql client for each SSR reset.');
      state = fresh;
    },
  };
  
  return adapter;
}
