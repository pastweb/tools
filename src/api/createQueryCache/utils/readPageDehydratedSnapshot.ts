import { DEHYDRATED_SCRIPT_ID } from '../constnts';

/**
 * Reads the page-level dehydrated query-cache snapshot from the current document.
 *
 * By default, it looks for a script element whose id is {@link DEHYDRATED_SCRIPT_ID}.
 * Pass a custom `scriptID` when the cache was created with
 * `createQueryCache({ deHydratedScriptID })`.
 *
 * @param scriptID - DOM script id that contains the serialized query-cache snapshot.
 * @returns The serialized snapshot text, or `null` when no browser document or
 * snapshot script is available.
 *
 * @example
 * const snapshot = readPageDehydratedSnapshot();
 * if (snapshot) queryCache.hydrate(snapshot);
 *
 * @example
 * const snapshot = readPageDehydratedSnapshot('__MY_API_STATE__');
 */
export function readPageDehydratedSnapshot(
  scriptID = DEHYDRATED_SCRIPT_ID,
): string | null {
  if (typeof document === 'undefined') return null;

  const el = document.getElementById(scriptID);

  return el?.textContent || null;
}
