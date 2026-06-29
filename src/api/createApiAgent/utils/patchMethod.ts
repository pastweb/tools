import { noop } from '../../../noop';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { AgentSettings, MutationOptions } from '../types';

/**
 * PATCH request. Supports `onSuccess`/`onError` via `MutationOptions` (for cache invalidation etc.).
 */
export async function patchMethod<T = any>(
  settings: AgentSettings,
  agent: AxiosInstance,
  url: string,
  data?: unknown,
  options: MutationOptions = {},
): Promise<AxiosResponse<T>> {
  const { onSuccess = noop, onError = noop, ...rest } = options;
  const config = Object.keys(rest).length ? rest : settings.agentConfig;

  try {
    const res = await agent.patch(url, data, config);
    onSuccess();
    return res as AxiosResponse<T>;
  } catch (e) {
    onError(e);
    throw e;
  }
}
