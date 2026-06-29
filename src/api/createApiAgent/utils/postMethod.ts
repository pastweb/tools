import { noop } from '../../../noop';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { AgentSettings, MutationOptions } from '../types';

/**
 * POST request. Supports `onSuccess`/`onError` via `MutationOptions`.
 */
export async function postMethod<T = any>(
  settings: AgentSettings,
  agent: AxiosInstance,
  url: string,
  data?: unknown,
  options: MutationOptions = {},
): Promise<AxiosResponse<T>> {
  const { onSuccess = noop, onError = noop, ...rest } = options;
  const config = Object.keys(rest).length ? rest : settings.agentConfig;

  try {
    const res = await agent.post(url, data, config);
    onSuccess();
    return res as AxiosResponse<T>;
  } catch (e) {
    onError(e);
    throw e;
  }
}
