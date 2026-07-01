import { noop } from '../../../noop';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { QueryCache } from '../../createQueryCache';
import type { AgentSettings, MutationOptions } from '../types';

/**
 * Performs a DELETE request.
 * When the agent has a `queryCache`, `onSuccess`/`onError` from options are invoked.
 * Use those callbacks to call `invalidateQuery` on the cache instance you passed to the agent.
 */
export async function deleteMethod<T = any>(
  settings: AgentSettings,
  agent: AxiosInstance,
  url: string,
  options: MutationOptions = {},
  queryCache?: QueryCache,
): Promise<AxiosResponse<T>> {
  const { onSuccess = noop, onError = noop, ...rest } = options;
  const config = Object.keys(rest).length ? rest : settings.agentConfig;

  if (queryCache) {
    try {
      const res = await agent.delete(url, config);
      onSuccess();
      return res as AxiosResponse<T>;
    } catch (e) {
      onError(e);
      throw e;
    }
  }

  return await agent.delete(url, config);
}
