import { deepMerge } from '../../../deepMerge';
import type { AxiosRequestConfig } from 'axios';
import type { AgentSettings } from '../types';

/**
 * Deep merges additional Axios request configuration into the agent's default `agentConfig`.
 */
export function mergeAgentConfig(settings: AgentSettings, newSettings: AxiosRequestConfig): void {
  settings.agentConfig = deepMerge(settings.agentConfig, newSettings);
}
