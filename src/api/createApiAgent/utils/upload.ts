import { deepMerge } from '../../../deepMerge';
import { postMethod } from './postMethod';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { AgentSettings } from '../types';

/**
 * Convenience wrapper around POST that forces the multipart/form-data Content-Type.
 * The provided `data` should be a `FormData` instance.
 */
export function upload<T = any>(
  settings: AgentSettings,
  agent: AxiosInstance,
  url: string,
  data: FormData,
  config: AxiosRequestConfig = {},
): Promise<AxiosResponse<T>> {
  return postMethod(settings, agent, url, data, deepMerge(settings.agentConfig, settings.uploadConfig, config));
}
