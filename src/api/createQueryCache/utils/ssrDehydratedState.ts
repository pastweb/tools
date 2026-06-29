/**
 * Holds the active query-cache dehydrate snapshot for the current SSR render pass.
 *
 * SSR renderers set this before the final render so framework components can embed
 * per-island query-cache slices during SSR.
 */
let currentSnapshot: string | null = null;

export function setSSRDehydratedState(snapshot: string | null): void {
  currentSnapshot = snapshot;
}

export function getSSRDehydratedState(): string | null {
  return currentSnapshot;
}

export function clearSSRDehydratedState(): void {
  currentSnapshot = null;
}
