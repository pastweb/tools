import { expectTypeOf } from 'vitest';
import { gql } from '@urql/core';
import { createApiAgent, useQuery, useMutation } from '../../src/api';
import { createUrqlAdapter } from '../../src/api/urql';

/** Compile-time checks for generated pagination variables and typed results. */
export async function checkGraphQLTypes() {
  type Data = { users: { id: string }[] };
  const document = gql<Data, { offset: number; limit: number; search?: string }>`query Users($offset: Int!, $limit: Int!, $search: String) { users(offset: $offset, limit: $limit, search: $search) { id } }`;
  const api = createApiAgent({ gql: createUrqlAdapter() });
  const result = await api.query(document, { page: 2, variables: { search: 'Nico' } });
  expectTypeOf(result.data).toEqualTypeOf<Data | undefined>();
  const state = useQuery({ fn: () => api.query(document, { page: 2 }), immediate: false });
  expectTypeOf(state.data).toEqualTypeOf<Data | null>();
  // @ts-expect-error Explicit variable values must match the typed document.
  await api.query(document, { variables: { search: 123 } });
  const update = gql<{ renamed: boolean }, { name: string }>`mutation Rename($name: String!) { renamed: rename(name: $name) }`;
  const mutation = useMutation({ fn: () => api.mutation(update, { variables: { name: 'Nico' } }) });
  expectTypeOf(mutation.data).toEqualTypeOf<{ renamed: boolean } | null>();
}
