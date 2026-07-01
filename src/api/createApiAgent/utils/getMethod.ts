import { reportApiSSRToTracker } from '../../../ssrUtils/ssrTracker/reportApiSSR';
import { withToonAcceptHeader } from './withToonAcceptHeader';
import type { AxiosInstance } from 'axios';
import type { QueryCache } from '../../createQueryCache';
import type { AgentSettings, QueryOptions, QueryResponse } from '../types';

/**
 * Performs a GET request.
 *
 * If the agent was given a `queryCache` via `createApiAgent({ queryCache })`,
 * the call goes through the cache layer:
 * - Returns cached data when fresh.
 * - In SSR: returns a placeholder immediately and registers the request. Use the
 *   `queryCache.dehydrate()` to execute registered prefetches and obtain a snapshot.
 *
 * `queryKey` (if provided) determines the cache key:
 * - `unknown[]` (recommended): serialized with JSON.stringify and used as the cache identifier.
 * - `string`: used as-is (via String coercion) for the cache key. Supported for compatibility.
 * - omitted: the full request URL (with query string) is used as the key.
 *
 * If `queryKey` or `expireIn` is passed in `options` but the agent was not created with
 * a `queryCache` in `AgentOptions`, a `console.error` is logged (these options have no
 * effect without an enabled cache).
 */
export async function getMethod<T = any>(
  settings: AgentSettings,
  agent: AxiosInstance,
  url: string,
  options: QueryOptions = {},
  queryCache?: QueryCache,
): Promise<QueryResponse<T>> {
  const {
    queryKey,
    expireIn,
    fetchOnExpired,
    fetchOnInvalidate,
    removeOnExpired,
    removeOnInvalidate,
    ssrMode,
    ssrRevalitate,
    toon,
    select,
    ...rest
  } = options;

  reportApiSSRToTracker(url, { queryKey, ssrMode, ssrRevalitate });

  const hasCacheOptions =
    !!queryKey ||
    !!expireIn ||
    !!fetchOnExpired ||
    !!fetchOnInvalidate ||
    !!removeOnExpired ||
    !!removeOnInvalidate;

  if (hasCacheOptions && !settings.options.queryCache) {
    console.error(
      '[createApiAgent] `get()` was called with cache-related options (queryKey, expireIn, fetchOnExpired, etc.) ' +
      'but no `queryCache` was passed in AgentOptions. These options will have no effect. ' +
      'Pass `queryCache: createQueryCache()` (or a shared instance) when creating the agent to enable caching.'
    );
  }

  const config = {
    ...(queryCache ? { expireIn } : {}),
    ...(queryCache ? { fetchOnExpired } : {}),
    ...(queryCache ? { fetchOnInvalidate } : {}),
    ...(queryCache ? { removeOnExpired } : {}),
    ...(queryCache ? { removeOnInvalidate } : {}),
    ...(queryCache && queryKey ? { queryKey } : {}),
    ...(Object.keys(rest).length ? rest : settings.agentConfig),
  };
  const requestConfig = toon ? withToonAcceptHeader(config) : config;

  if (queryCache) {
    const response = await queryCache.set(url, agent, requestConfig);
    return applySelect(response, select);
  }

  const response = await agent.get(url, requestConfig) as QueryResponse<T>;
  response.onData ??= () => {};
  return applySelect(response, select);
}

function applySelect<T = any>(
  response: QueryResponse<any>,
  select?: QueryOptions['select'],
): QueryResponse<T> {
  if (!select) return response as QueryResponse<T>;

  const onData = response.onData;
  const selectedResponse = {
    ...response,
    data: response.data === undefined ? undefined : select(response.data, response),
    onData(fn: (data: T) => void) {
      onData((data: any) => fn(select(data, response)));
    },
  };

  return selectedResponse as QueryResponse<T>;
}
