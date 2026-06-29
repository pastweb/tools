import type { SSRTrackerSnapshot } from './types';

/**
 * Builds a stable fingerprint string from an SSR tracker snapshot.
 *
 * Used by SSR router to key persisted `apiCache` entries and detect when static
 * page dependencies have changed. Keys are sorted for deterministic output.
 */
export function createDependencyFingerprint(snapshot: SSRTrackerSnapshot): string {
  const parts = snapshot.dependencies
    .map(dep => {
      const explicit = dep.key ?? dep.cacheKey ?? dep.url ?? dep.id;
      if (explicit !== undefined) return `${dep.type}:${String(explicit)}`;
      try {
        return `${dep.type}:${JSON.stringify(dep)}`;
      } catch {
        return `${dep.type}:${String(dep)}`;
      }
    })
    .sort();

  if (snapshot.isDynamic && snapshot.reasons.length) {
    parts.push(`dynamic:${[...snapshot.reasons].sort().join(',')}`);
  }

  return parts.join('|') || 'empty';
}