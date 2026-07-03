import type { IslandDefaultProps } from './types';

/**
 * Default hydration options shared by framework-specific Island components.
 *
 * Framework packages can merge these values with component props before they
 * choose when a server-rendered island should hydrate on the client.
 */
export const DEFAULT_ISLAND_PROPS: Pick<IslandDefaultProps, 'client' | 'idleTimeout'> = {
  client: 'visible',
  idleTimeout: 5000,
};

/**
 * Shared context key used by framework adapters to mark an active Island boundary.
 */
export const ISLAND_CONTEXT_KEY = '$$ISLAND_CONTEXT_KEY';
