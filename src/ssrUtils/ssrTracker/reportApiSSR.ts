import { isServer } from '../../envs';
import { serializeQueryKey } from '../../api/createQueryCache/utils';
import { stringToMs } from '../../stringToMs';
import { getCurrentSSRTracker } from './ssrTracker';
import type { ApiSSRMode } from '../../api/createApiAgent/types';

/**
 * Reports `agent.get` SSR semantics to the active {@link SSRTracker} during server renders.
 *
 * Called from `getMethod` when an SSR tracker is installed (typically by `runSSRCycle`
 * or SSR router). No-op on the client or when no tracker is active.
 */
export function reportApiSSRToTracker(
  url: string,
  options: {
    queryKey?: string | unknown[];
    ssrMode?: ApiSSRMode;
    ssrRevalitate?: string | false;
  } = {},
): void {
  if (!isServer) return;

  const tracker = getCurrentSSRTracker();
  if (!tracker) return;

  const { ssrMode = 'auto', queryKey, ssrRevalitate } = options;
  const cacheKey = serializeQueryKey(queryKey ?? url);

  if (ssrMode === 'dynamic' || ssrMode === 'no-store') {
    tracker.markDynamic(`api:${cacheKey}:${ssrMode}`);
    return;
  }

  const revalidate = normalizeSSRRevalitate(ssrRevalitate);

  tracker.addDependency({
    type: 'api',
    key: cacheKey,
    queryKey,
    url,
    cacheKey,
    ssrMode,
    ...(revalidate !== undefined ? { revalidate } : {}),
  });
}

function normalizeSSRRevalitate(value: string | false | undefined): number | false | undefined {
  if (value === undefined || value === false) return value;
  return stringToMs(value);
}
