import { noop } from '../../../noop';
import type { AxiosError, AxiosResponse } from 'axios';
import type { AgentSettings } from '../types';

/**
 * Intercepts and handles error responses.
 *
 * @param error - The error.
 * @throws The error after processing.
 */
export async function errorResponseInterceptor(
  settings: AgentSettings,
  error: AxiosError,
): Promise<void> {
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

  const { status } = error.response as AxiosResponse;
  const { onUnauthorizedResponse = noop } = settings.options;

  if (status === 401 || status === 403) {
    await onUnauthorizedResponse();
  }

  throw error;
}
