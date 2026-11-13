import { createRequest, stringifyDocument, stringifyVariables } from '@urql/core';
import type { AnyVariables, DocumentInput } from '@urql/core';

/**
 * Includes the endpoint in urql's operation identity to isolate URL overrides.
 * @example
 * ```ts
 * const request = createOperation('/graphql', '{ users { id } }', {});
 * ```
 */
export function createOperation<Data, Variables extends AnyVariables>(endpoint: string, document: DocumentInput<Data, Variables>, variables: Variables, defaultEndpoint = endpoint) {
  const request = createRequest(document, variables);
  if (endpoint === defaultEndpoint) return request;
  const identity = JSON.stringify([endpoint, stringifyDocument(request.query), stringifyVariables(variables)]);
  let key = 5381;
  for (let index = 0; index < identity.length; index++) key = (key * 33) ^ identity.charCodeAt(index);
  return { ...request, key: key >>> 0 };
}
