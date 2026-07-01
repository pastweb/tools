export type SSRTrackerPhase = 'collect' | 'resolve-tasks' | 'dehydrate' | 'render';

/**
 * Render-time fact collected by the SSR tracker.
 */
export interface SSRDependency {
  /** Dependency category, for example `api`. */
  type: string;
  /** Optional stable dependency key. */
  key?: string;
  /** SSR phase where the dependency was collected. Defaults to the current tracker phase. */
  phase?: SSRTrackerPhase;
  [prop: string]: unknown;
};

/**
 * Initial options used by {@link createSSRTracker}.
 */
export interface SSRTrackerOptions {
  /** Route path associated with the current SSR cycle. */
  route?: string;
  /** Initial tracker phase. @default 'collect' */
  phase?: SSRTrackerPhase;
  /** Initial render mode. `runSSRCycle` keeps this value synchronized before every phase. @default false */
  isStatic?: boolean;
};

/**
 * Serializable snapshot of the current SSR tracker state.
 */
export interface SSRTrackerSnapshot {
  /** Current render mode for the active phase. */
  isStatic: boolean;
  /** Whether any dependency has marked the page as dynamic. */
  isDynamic: boolean;
  /** Reasons that prevent static HTML persistence. */
  reasons: string[];
  /** Dependencies collected during the current SSR cycle. */
  dependencies: SSRDependency[];
  /** Current SSR phase. */
  phase: SSRTrackerPhase;
  /** Route path associated with the current SSR cycle. */
  route?: string;
};

/**
 * Tracks render mode, dynamic signals, and dependencies during an SSR cycle.
 */
export interface SSRTracker {
  /** Current render mode selected by the SSR cycle. */
  readonly isStatic: boolean;
  /** Whether collected signals force dynamic output. */
  readonly isDynamic: boolean;
  /** Dynamic downgrade reasons. */
  readonly reasons: Set<string>;
  /** Collected dependencies keyed by stable dependency id. */
  readonly dependencies: Map<string, SSRDependency>;
  /** Current SSR phase. */
  readonly phase: SSRTrackerPhase;
  /** Route path associated with the current SSR cycle. */
  readonly route?: string;
  /** Updates the current render mode before a render/dehydrate phase runs. */
  setStaticMode: (isStatic: boolean) => void;
  /** Updates the current SSR phase. */
  setPhase: (phase: SSRTrackerPhase) => void;
  /** Marks the current page render as dynamic. */
  markDynamic: (reason: string) => void;
  /** Adds a dependency and returns its stable tracker key. */
  addDependency: (dependency: SSRDependency) => string;
  /** Returns a serializable snapshot of the current tracker state. */
  snapshot: () => SSRTrackerSnapshot;
  /** Clears collected dependencies/reasons and restores the initial phase/render mode. */
  reset: () => void;
};
