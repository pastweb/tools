import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosProgressEvent,
} from 'axios';
import { deepMerge } from '../deepMerge';
import { noop } from '../noop';
import type { Agent, AgentSettings } from './types';

/**
 * Creates an API agent with customizable settings for HTTP requests.
 *
 * @param {AgentSettings} [settings={}] - The settings for the API agent.
 * @param {boolean} [settings.withCredentials=false] - Indicates whether cross-site Access-Control requests should be made using credentials.
 * @param {Record<string, any>} [settings.headers={}] - Custom headers to be sent with each request.
 * @param {string | RegExp | Array<string | RegExp>} [settings.exclude] - URLs or patterns to exclude from request intercepting.
 * @param {() => Promise<Record<string, any>>} [settings.onGetValidToken] - Function to get a valid token for authorization.
 * @param {() => void} [settings.onUnauthorizedResponse] - Callback for unauthorized responses.
 * @returns {Agent} - The configured API agent.
 */
export function createApiAgent(settings: AgentSettings = {}): Agent {
  let agentConfig: AxiosRequestConfig = {
    headers: {},
  };

  let uploadConfig: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  let downloadConfig: AxiosRequestConfig = {
    responseType: 'blob',
  };

  setAgentConfig(settings);

  const agent = axios.create();
  agent.interceptors.request.use(requestInterceptor as any);
  agent.interceptors.response.use(successResponseInterceptor, errorResponseInterceptor);

  /**
   * Checks if a URL is excluded from request interception.
   *
   * @param {string} [url] - The URL to check.
   * @returns {boolean} - Whether the URL is excluded.
   */
  function isExcluded(url?: string): boolean {
    if (!url) return false;

    const exclude = Array.isArray(settings.exclude) ?
    settings.exclude : settings.exclude ?
      [ settings.exclude ] : [];

    for (const rule of exclude) {
      if (typeof rule === 'string' && rule === url) {
        return true;
      }

      if (rule instanceof RegExp && (rule as RegExp).test(url)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Intercepts and modifies request configurations.
   *
   * @param {AxiosRequestConfig} requestConfig - The request configuration.
   * @returns {Promise<AxiosRequestConfig>} - The modified request configuration.
   */
  async function requestInterceptor(requestConfig: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    // high function to ptint or collect some log
    const { url } = requestConfig;

    if (isExcluded(url)) return requestConfig;

    const { onGetValidToken } = settings;

    if (onGetValidToken) {
      const tokenHeader = await onGetValidToken();

      if (tokenHeader) {
        return deepMerge(requestConfig, {
          headers: { ...tokenHeader },
        });
      } else {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 16);

        return deepMerge(requestConfig, {
          signal: controller.signal,
        });
      }
    }

    return requestConfig;
  }

  /**
   * Intercepts and handles successful responses.
   *
   * @param {AxiosResponse} res - The response.
   * @returns {Promise<AxiosResponse>} - The unmodified response.
   */
  async function successResponseInterceptor(res: AxiosResponse): Promise<AxiosResponse> {
    // high function to ptint or collect some log
    return res;
  }

  /**
   * Intercepts and handles error responses.
   *
   * @param {AxiosError} error - The error.
   * @throws {AxiosError} - The error after processing.
   */
  async function errorResponseInterceptor(error: AxiosError): Promise<void> {
    // high function to ptint or collect some log
    if (!error || !error.response) {
      Object.assign(error, {
        statusText: 'Network Error',
        data: {
          code: 0,
          message: 'Network Error',
        },
        response: {
          data: {
            network: {
              message: 'Network Error',
              code: 'network',
              statusCode: 0,
            },
          },
        },
      });
    }

    const { status } = (error.response as AxiosResponse);
    const { onUnauthorizedResponse = noop } = settings;

    if ((status === 401) || (status === 403)) {
      await onUnauthorizedResponse();
    }
  
    throw error;
  }

  /**
   * Sets the agent configuration.
   *
   * @param {AgentSettings} [settings={}] - The settings for the API agent.
   */
  function setAgentConfig(settings: AgentSettings): void {
    const { withCredentials = false, headers = {} } = settings;

    if (withCredentials) {
      agentConfig = { withCredentials, ...agentConfig };
      uploadConfig = { withCredentials, ...uploadConfig };
      downloadConfig = { withCredentials, ...downloadConfig };
    } else {
      agentConfig = {
        headers: {
          ...headers,
          ...agentConfig.headers,
        },
      };
    }
  };

  /**
   * Merges new settings into the existing agent configuration.
   *
   * @param {AxiosRequestConfig} newSettings - The new settings to merge.
   */
  function mergeAgentConfig(newSettings: AxiosRequestConfig): void {
    agentConfig = deepMerge(agentConfig, newSettings);
  }

  /**
   * Sends a DELETE request.
   *
   * @param {string} url - The URL to send the request to.
   * @param {AxiosRequestConfig} [config] - Optional configuration for the request.
   * @returns {Promise<AxiosResponse>} - The response.
   */
  function _delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return agent.delete(url, config || agentConfig);
  }

  /**
   * Sends a GET request.
   *
   * @param {string} url - The URL to send the request to.
   * @param {AxiosRequestConfig} [config] - Optional configuration for the request.
   * @returns {Promise<AxiosResponse>} - The response.
   */
  function get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return agent.get(url, config || agentConfig);
  }

  /**
   * Sends a PATCH request.
   *
   * @param {string} url - The URL to send the request to.
   * @param {unknown} [data] - The data to send with the request.
   * @param {AxiosRequestConfig} [config] - Optional configuration for the request.
   * @returns {Promise<AxiosResponse>} - The response.
   */
  function patch(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return agent.patch(url, data, config || agentConfig);
  }

  /**
   * Sends a POST request.
   *
   * @param {string} url - The URL to send the request to.
   * @param {unknown} [data] - The data to send with the request.
   * @param {AxiosRequestConfig} [config] - Optional configuration for the request.
   * @returns {Promise<AxiosResponse>} - The response.
   */
  function post(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return agent.post(url, data, config || agentConfig);
  }

  /**
   * Sends a PUT request.
   *
   * @param {string} url - The URL to send the request to.
   * @param {unknown} [data] - The data to send with the request.
   * @param {AxiosRequestConfig} [config] - Optional configuration for the request.
   * @returns {Promise<AxiosResponse>} - The response.
   */
  function put(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return agent.put(url, data, config || agentConfig);
  }

  /**
   * Uploads a file using a POST request.
   *
   * @param {string} url - The URL to send the request to.
   * @param {FormData} data - The form data to send with the request.
   * @param {(e: AxiosProgressEvent) => void} [onUploadProgress=noop] - The progress event handler.
   * @returns {Promise<AxiosResponse>} - The response.
   */
  function upload(url: string, data: FormData, onUploadProgress: (e: AxiosProgressEvent) => void = noop): Promise<AxiosResponse> {
    return this.post(url, data, deepMerge(agentConfig, uploadConfig, { onUploadProgress }));
  }

  /**
   * Downloads a file using a GET request and triggers a download in the browser.
   *
   * @param {string} url - The URL to send the request to.
   * @param {string} fileName - The name of the file to be downloaded.
   * @param {HTMLElement} [domElement=document.body] - The DOM element to which the temporary link will be appended.
   * @returns {Promise<AxiosResponse>} - The response.
   */
  async function download(url: string, fileName: string, domElement: HTMLElement = document.body): Promise<AxiosResponse> {
    const res = await this.get(url, downloadConfig);
    const { data } = res;
    const _url = URL.createObjectURL(data); // Create a url for the Blob
    const link = document.createElement('a'); // Create a temporary anchor tag
    link.href = _url; // Set the href attribute
    link.setAttribute('download', fileName); // The default name of the downloaded file
    domElement.appendChild(link); // Append the anchor tag to the document
    link.click(); // Start the download
    domElement.removeChild(link); // Clean up the anchor tag element
    URL.revokeObjectURL(_url); // Remove the url
    return res;
  }

  const agentObject = {
    agent,
    agentConfig,
    downloadConfig,
    uploadConfig,
    setAgentConfig,
    mergeAgentConfig,
    download,
    delete: _delete,
    get,
    patch,
    post,
    put,
    upload,
  };

  Object.defineProperties(agentObject, {
    agentConfig: { get() { return agentConfig; } },
    downloadConfig: { get() { return downloadConfig; } },
    uploadConfig: { get() { return uploadConfig; } },
  });

  return agentObject;
}
