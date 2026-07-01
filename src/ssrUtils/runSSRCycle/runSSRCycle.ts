import {
  createSSRTracker,
  setCurrentSSRTracker,
  clearCurrentSSRTracker,
  createDependencyFingerprint,
} from '../ssrTracker';
import type { SSRTracker, SSRTrackerPhase } from '../ssrTracker';
import type { RunSSRCycleOptions, SSRCycleResult } from './types';

/**
 * Runs the framework-agnostic SSR collection → prefetch → render cycle.
 *
 * Phase order:
 * 1. collect #1 — sync tree registers prefetches + async tasks
 * 2. resolve-tasks — load async component modules
 * 3. collect #2 — async subtrees register remaining prefetches
 * 4. dehydrate — execute prefetches, produce snapshot
 * 5. hydrate — seed in-memory cache for final render
 * 6. render — final HTML
 * 7. hybrid decision — downgrade to dynamic if tracker disproves static attempt
 *
 * Installs the SSR tracker for the duration of the cycle so `agent.get({ ssrMode })`
 * and other reporters can record dependencies.
 */
export async function runSSRCycle(options: RunSSRCycleOptions): Promise<SSRCycleResult> {
  const {
    route,
    queryCache,
    resolveAsyncTasks,
    render,
    onStaticProven,
    onDynamicDowngrade,
  } = options;

  const ownsTracker = !options.tracker;
  const attemptedStatic = await resolveShouldAttemptStatic(options.shouldAttemptStatic);
  const tracker: SSRTracker = options.tracker ?? createSSRTracker({ route, isStatic: attemptedStatic });
  const phases: SSRTrackerPhase[] = [];

  let isStatic = attemptedStatic;
  let downgraded = false;
  let snapshot: string | null = null;
  let html = '';
  const resetQueryCache = options.resetQueryCache ?? !!queryCache;

  setCurrentSSRTracker(tracker);

  try {
    if (resetQueryCache && queryCache) {
      queryCache.resetForSSR();
    }

    await runPhase(tracker, phases, 'collect', isStatic, async () => {
      await render({ isStatic, phase: 'collect', apiDehydratedState: null });
    });

    if (resolveAsyncTasks) {
      await runPhase(tracker, phases, 'resolve-tasks', isStatic, resolveAsyncTasks);
    }

    await runPhase(tracker, phases, 'collect', isStatic, async () => {
      await render({ isStatic, phase: 'collect', apiDehydratedState: null });
    });

    if (queryCache) {
      await runPhase(tracker, phases, 'dehydrate', isStatic, async () => {
        snapshot = await queryCache.dehydrate();
      });

      if (snapshot) {
        queryCache.hydrate(snapshot);
      }
    }

    html = await runPhase(tracker, phases, 'render', isStatic, () =>
      render({ isStatic, phase: 'render', apiDehydratedState: snapshot })
    );

    const trackerSnapshot = tracker.snapshot();
    const fingerprint = createDependencyFingerprint(trackerSnapshot);

    if (attemptedStatic && trackerSnapshot.isDynamic) {
      downgraded = true;
      isStatic = false;

      html = await runPhase(tracker, phases, 'render', isStatic, () =>
        render({ isStatic: false, phase: 'render', apiDehydratedState: snapshot })
      );

      const downgradeResult: SSRCycleResult = {
        html,
        isStatic: false,
        attemptedStatic,
        downgraded,
        snapshot,
        fingerprint,
        trackerSnapshot: tracker.snapshot(),
        phases: [...phases],
      };

      await onDynamicDowngrade?.(downgradeResult);
      return downgradeResult;
    }

    const result: SSRCycleResult = {
      html,
      isStatic,
      attemptedStatic,
      downgraded,
      snapshot,
      fingerprint,
      trackerSnapshot,
      phases: [...phases],
    };

    if (attemptedStatic && !trackerSnapshot.isDynamic) {
      await onStaticProven?.(result);
    }

    return result;
  } finally {
    if (ownsTracker) {
      clearCurrentSSRTracker();
    }
  }
}

async function resolveShouldAttemptStatic(
  value: RunSSRCycleOptions['shouldAttemptStatic'],
): Promise<boolean> {
  if (value === undefined) return false;
  if (typeof value === 'function') return !!(await value());
  return !!value;
}

async function runPhase<T>(
  tracker: SSRTracker,
  phases: SSRTrackerPhase[],
  phase: SSRTrackerPhase,
  isStatic: boolean,
  fn: () => Promise<T>,
): Promise<T> {
  tracker.setPhase(phase);
  tracker.setStaticMode(isStatic);
  phases.push(phase);
  return fn();
}
