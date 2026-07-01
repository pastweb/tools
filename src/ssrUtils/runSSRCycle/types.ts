import type { QueryCache } from '../../api/createQueryCache';
import type { SSRTracker, SSRTrackerPhase, SSRTrackerSnapshot } from '../ssrTracker';

export interface SSRCycleRenderContext {
  /** Current render mode for this phase. */
  isStatic: boolean;
  /** Current SSR phase. */
  phase: SSRTrackerPhase;
  /** Serialized query-cache snapshot available during the final render phase. */
  apiDehydratedState: string | null;
}

/**
 * Renderer called by {@link runSSRCycle} for collect and render phases.
 */
export type SSRCycleRenderFn = (ctx: SSRCycleRenderContext) => Promise<string>;

export interface RunSSRCycleOptions {
  /** Route path used for tracker metadata. */
  route?: string;
  /** Existing tracker or one will be created when omitted. */
  tracker?: SSRTracker;
  /** Whether to attempt static output for this request. @default false */
  shouldAttemptStatic?: boolean | (() => boolean | Promise<boolean>);
  /** Shared query cache with dehydrate/hydrate/resetForSSR. */
  queryCache?: QueryCache;
  /** Loads async components registered during collection (e.g. resolveAsyncTasks). */
  resolveAsyncTasks?: () => Promise<void>;
  /** Page render function invoked for each phase. The active tracker is synchronized before this function runs. */
  render: SSRCycleRenderFn;
  /** Reset in-memory query cache before collection. @default true when queryCache provided */
  resetQueryCache?: boolean;
  /** Called when static render is proven (tracker approves). */
  onStaticProven?: (result: SSRCycleResult) => void | Promise<void>;
  /** Called when static attempt is downgraded to dynamic. */
  onDynamicDowngrade?: (result: SSRCycleResult) => void | Promise<void>;
}

export interface SSRCycleResult {
  html: string;
  /** Final render mode used for the returned HTML. */
  isStatic: boolean;
  /** Whether a static render was attempted. */
  attemptedStatic: boolean;
  /** Whether static was downgraded due to dynamic tracker signals. */
  downgraded: boolean;
  /** Dehydrate snapshot from this cycle (null if no queryCache). */
  snapshot: string | null;
  /** Dependency fingerprint for persisting apiCache / page manifests. */
  fingerprint: string;
  /** Final tracker snapshot, including the final `isStatic` render mode. */
  trackerSnapshot: SSRTrackerSnapshot;
  /** Ordered list of phases executed (for testing / debugging). */
  phases: SSRTrackerPhase[];
}
