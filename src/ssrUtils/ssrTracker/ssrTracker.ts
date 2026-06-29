import { isServer } from '../../envs';
import type {
  SSRDependency,
  SSRTracker,
  SSRTrackerOptions,
  SSRTrackerPhase,
  SSRTrackerSnapshot,
} from './types';

let currentSSRTracker: SSRTracker | undefined;

/**
 * Creates an SSR tracker used to collect render-time information during a
 * server-side render cycle.
 *
 * The tracker is intentionally framework-agnostic. Routers, API agents, async
 * task utilities, and framework adapters can all report facts to the active
 * tracker without depending on each other.
 */
export function createSSRTracker(options: SSRTrackerOptions = {}): SSRTracker {
  const { route, phase = 'collect' } = options;
  const reasons = new Set<string>();
  const dependencies = new Map<string, SSRDependency>();
  let currentPhase: SSRTrackerPhase = phase;

  const tracker: SSRTracker = {
    get isDynamic() { return reasons.size > 0; },
    get reasons() { return reasons; },
    get dependencies() { return dependencies; },
    get phase() { return currentPhase; },
    get route() { return route; },
    setPhase,
    markDynamic,
    addDependency,
    snapshot,
    reset,
  };

  function setPhase(phase: SSRTrackerPhase): void {
    currentPhase = phase;
  }

  function markDynamic(reason: string): void {
    if (!reason) return;
    reasons.add(reason);
  }

  function addDependency(dependency: SSRDependency): string {
    const dep = { phase: currentPhase, ...dependency };
    const key = dependency.key || createDependencyKey(dep);
    dependencies.set(key, dep);
    return key;
  }

  function snapshot(): SSRTrackerSnapshot {
    return {
      isDynamic: tracker.isDynamic,
      reasons: Array.from(reasons),
      dependencies: Array.from(dependencies.values()),
      phase: currentPhase,
      ...(route ? { route } : {}),
    };
  }

  function reset(): void {
    reasons.clear();
    dependencies.clear();
    currentPhase = phase;
  }

  return tracker;
}

/**
 * Installs the active SSR tracker for the current server render cycle.
 *
 * This is a no-op in browser-like environments so application code can call it
 * defensively without changing client behavior.
 */
export function setCurrentSSRTracker(tracker?: SSRTracker): void {
  if (!isServer) return;
  currentSSRTracker = tracker;
}

/**
 * Returns the active SSR tracker, if one is installed for the current server
 * render cycle.
 */
export function getCurrentSSRTracker(): SSRTracker | undefined {
  if (!isServer) return undefined;
  return currentSSRTracker;
}

/**
 * Clears the active SSR tracker.
 *
 * SSR renderers should call this in a finally block after every SSR request.
 */
export function clearCurrentSSRTracker(): void {
  currentSSRTracker = undefined;
}

function createDependencyKey(dependency: SSRDependency): string {
  const { type, phase } = dependency;
  const explicit = dependency.cacheKey || dependency.queryKey || dependency.url || dependency.id;
  if (explicit !== undefined) return `${type}:${String(explicit)}`;
  return `${type}:${phase}:${dependenciesHash(dependency)}`;
}

function dependenciesHash(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
