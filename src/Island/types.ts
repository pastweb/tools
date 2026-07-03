/**
 * Hydration strategies supported by framework-specific Island components.
 *
 * - `load`: Hydrate as soon as the client entry is ready.
 * - `idle`: Hydrate when the browser is idle, optionally bounded by `idleTimeout`.
 * - `visible`: Hydrate when the island enters the viewport.
 * - `media`: Hydrate when the configured media query matches.
 * - `none`: Never hydrate automatically.
 */
export type ClientStrategy =
  | 'load'
  | 'idle'
  | 'visible'
  | 'media'
  | 'none';

/**
 * Shared props for framework-specific Island components.
 *
 * An Island controls when a server-rendered subtree hydrates. It does not
 * receive provider props and does not install API, router, or portal context by
 * itself. When an island needs providers, render a component that already
 * includes them.
 *
 * Framework packages can expose helpers such as `useIsland()` around these
 * shared props and constants to detect the active island boundary.
 */
export interface IslandProps {
  /** Hydration strategy to use for the island. */
  client?: ClientStrategy;

  /** Media query used when `client` is `media`, for example `(min-width: 1024px)`. */
  media?: string;

  /** Optional framework-specific fallback content shown before hydration. */
  fallback?: any;

  /**
   * Maximum delay in milliseconds before forcing hydration when `client` is `idle`.
   *
   * Only used when requestIdleCallback is available.
   *
   * @default 5000
   */
  idleTimeout?: number;

  /** Stable id exposed as `data-island-id` for external orchestration. */
  islandId?: string;
}

/**
 * Island props after defaults have been applied.
 *
 * Framework adapters can use this type for normalized props after merging
 * `DEFAULT_ISLAND_PROPS` with user-provided props.
 */
export interface IslandDefaultProps {
  /** Hydration strategy to use for the island. */
  client: ClientStrategy;

  /** Media query used when `client` is `media`. */
  media?: string;

  /** Optional framework-specific fallback content shown before hydration. */
  fallback?: any;

  /** Maximum idle hydration delay in milliseconds. */
  idleTimeout: number;

  /** Stable id exposed as `data-island-id` for external orchestration. */
  islandId?: string;
}
