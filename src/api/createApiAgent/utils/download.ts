import { deepMerge } from '../../../deepMerge';
import { getMethod } from './getMethod';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { QueryCache } from '../../createQueryCache';
import type { AgentSettings } from '../types';

/**
 * Performs a GET that returns a blob and automatically triggers a browser download
 * using a temporary anchor + `URL.createObjectURL`.
 */
export async function download<T = any>(
  settings: AgentSettings,
  agent: AxiosInstance,
  url: string,
  fileName: string,
  config: AxiosRequestConfig & { domElement?: HTMLElement } = {},
  queryCache?: QueryCache,
): Promise<AxiosResponse<T>> {
  const { domElement = document.body, ...rest } = config;
  const res = await getMethod(
    settings,
    agent,
    url,
    deepMerge(settings.agentConfig, settings.downloadConfig, rest),
    queryCache,
  );
  const { data } = res;
  const _url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = _url;
  link.setAttribute('download', fileName);
  domElement.appendChild(link);
  link.click();
  domElement.removeChild(link);
  URL.revokeObjectURL(_url);
  return res;
}
