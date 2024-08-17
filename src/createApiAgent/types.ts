import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, AxiosProgressEvent } from 'axios';

export type ValidTokenResponse = AxiosRequestConfig['headers'] | null | false | undefined;

export type AgentSettings = {
  headers?: AxiosRequestConfig['headers'];
  withCredentials?: boolean;
  exclude?: string | RegExp | (string | RegExp)[];
  onGetValidToken?: () => ValidTokenResponse | Promise<ValidTokenResponse>;
  onUnauthorizedResponse?: () => void | Promise<void>;
}

export type RequestInterceptor = (config: AxiosRequestConfig) => AxiosRequestConfig;

export type SuccessResponseInterceptor = (res: AxiosResponse) => AxiosResponse;

export type ErrorResponseInterceptor = (err: AxiosError) => void ;

export interface Agent {
  agent: AxiosInstance;
  agentConfig: AxiosRequestConfig;
  downloadConfig: AxiosRequestConfig;
  uploadConfig: AxiosRequestConfig;
  setAgentConfig: (config: AxiosRequestConfig) => void;
  mergeAgentConfig: (newSettings: AxiosRequestConfig) => void;
  download: (url: string, fileName: string, domElement?: HTMLElement) => Promise<AxiosResponse>;
  delete: (url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse>;
  get: (url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse>;
  patch: (url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse>;
  post: (url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse>;
  put: (url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse>;
  upload: (url: string, data: FormData, onUploadProgress?: (e: AxiosProgressEvent) => void) => Promise<AxiosResponse>;
}
