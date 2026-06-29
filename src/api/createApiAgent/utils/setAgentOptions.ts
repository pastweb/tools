import type { AgentOptions, AgentSettings, PaginationConfig } from '../types';

/**
 * Applies (or re-applies) agent options. This is also called once during construction.
 * Updates internal `agentConfig`, `uploadConfig`, `downloadConfig` and stored `opt`.
 */
export function setAgentOptions(settings: AgentSettings, options: AgentOptions): void {
  const { withCredentials = false, headers = {}, pagination = true, exclude, ...rest } = options;

  if (withCredentials) {
    settings.agentConfig = { withCredentials, ...settings.agentConfig };
    settings.uploadConfig = { withCredentials, ...settings.uploadConfig };
    settings.downloadConfig = { withCredentials, ...settings.downloadConfig };
  } else {
    settings.agentConfig = {
      headers: {
        ...headers,
        ...settings.agentConfig.headers,
      },
    };
  }

  const defaultPagination: PaginationConfig = {
    defaultPageLimit: 100,
    header: 'Content-Range',
  };

  settings.options = {
    pagination:
      (!pagination && typeof pagination === 'undefined') ||
      (pagination && typeof pagination === 'boolean')
        ? defaultPagination
        : { ...defaultPagination, ...pagination },
    ...(exclude ? { exclude } : {}),
    ...rest,
  };
}
