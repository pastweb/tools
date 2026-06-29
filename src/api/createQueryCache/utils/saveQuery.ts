import { isServer } from '../../../envs';
import { getSerializableConfig } from './getSerializableConfig';
import type { AxiosResponse } from 'axios';
import type { CacheMaps, SaveQueryOptions } from '../types';

/**
 * Writes or updates a cache entry and notifies any `onData` WeakRef subscribers.
 *
 * On the server, also persists `url` + serializable `config` for `dehydrate` replay.
 * Lifecycle options from `options` are copied onto the stored `QueryData`.
 *
 * @param cacheMaps - Internal cache + recall maps.
 * @param queryKey - Storage key (URL or serialized `queryKey`).
 * @param response - Axios response to store.
 * @param options - {@link SaveQueryOptions} including `expireIn` and lifecycle flags.
 *
 * @internal
 */
export function saveQuery(
  cacheMaps: CacheMaps,
  queryKey: string,
  response: AxiosResponse,
  options: SaveQueryOptions,
): void {
  const { queryCache } = cacheMaps;
  const {
    url,
    config,
    invalid = false,
    expireIn,
    fetchOnExpired,
    fetchOnInvalidate,
    removeOnExpired,
    removeOnInvalidate,
    timestamp,
  } = options;
  const query = queryCache.get(queryKey);

  const data = {
    ...isServer ? { url, config: getSerializableConfig(config) } : {},
    invalid,
    response,
    timestamp: timestamp ?? Date.now(),
    ...expireIn ? { expireIn } : {},
    ...fetchOnExpired ? { fetchOnExpired } : {},
    ...fetchOnInvalidate ? { fetchOnInvalidate } : {},
    ...removeOnExpired ? { removeOnExpired } : {},
    ...removeOnInvalidate ? { removeOnInvalidate } : {},
  };

  if (query) {
    Object.assign(query, data);
    query.response = response;

    const remove: WeakRef<Function>[] = [];
    query.onDataCallbacks.forEach(wr => {
      const fn = wr.deref();
      if (fn) fn(response.data);
      else remove.push(wr);
    });

    remove.forEach(wr => query.onDataCallbacks.delete(wr));

    return;
  }

  queryCache.set(queryKey, { ...data, onDataCallbacks: new Set<WeakRef<Function>>() });
}
