import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { createApiAgent, useMutation } from '../../src/api';
import type { AxiosResponse } from 'axios';

describe('given useMutation integrated with createApiAgent, when executing mutations with various options, then state management, lifecycle hooks, error handling, and isolation work as expected', () => {
  let mock: MockAdapter;
  let agent: ReturnType<typeof createApiAgent>;

  beforeEach(() => {
    agent = createApiAgent({
      pagination: { defaultPageLimit: 10, header: 'Content-Range' },
    });
    mock = new MockAdapter(agent.agent);
    vi.useFakeTimers();
  });

  afterEach(() => {
    mock.reset();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('given only a mutation fn, when useMutation is called, then isPending, isMutating, isError are false, data and error are null, and isPlaceholderData is false', () => {
    const fn = vi.fn().mockResolvedValue({ data: { id: 1 } } as AxiosResponse);
    const mutation = useMutation({ fn });

    expect(mutation.isPending).toBe(false);
    expect(mutation.isMutating).toBe(false);
    expect(mutation.isError).toBe(false);
    expect(mutation.data).toBe(null);
    expect(mutation.error).toBe(null);
    expect(mutation.isPlaceholderData).toBe(false);
  });

  it('given initialData along with fn, when useMutation is called, then data matches initialData, isPlaceholderData is true, and pending/mutating states are false', () => {
    const initialData = { id: 0 };
    const fn = vi.fn().mockResolvedValue({ data: { id: 1 } } as AxiosResponse);
    const mutation = useMutation({ fn, initialData });

    expect(mutation.data).toEqual(initialData);
    expect(mutation.isPlaceholderData).toBe(true);
    expect(mutation.isPending).toBe(false);
    expect(mutation.isMutating).toBe(false);
  });

  it('given a fn that posts data via agent, when mutate is invoked with payload, then isPending and isMutating become false, data is set to response, no error, placeholder false, and correct request was recorded', async () => {
    const responseData = { id: 1, name: 'test' };
    mock.onPost('/test').reply(200, responseData, { 'content-type': 'application/json' });

    const mutation = useMutation({
      fn: (data: any) => agent.post('/test', data),
    });

    expect(mutation.isPending).toBe(false);
    expect(mutation.isMutating).toBe(false);
    expect(mutation.data).toBe(null);

    await mutation.mutate({ name: 'test' });

    expect(mutation.isPending).toBe(false);
    expect(mutation.isMutating).toBe(false);
    expect(mutation.data).toEqual(responseData);
    expect(mutation.isError).toBe(false);
    expect(mutation.error).toBe(null);
    expect(mutation.isPlaceholderData).toBe(false);
    expect(mock.history.post[0].url).toBe('/test');
    expect(mock.history.post[0].data).toBe(JSON.stringify({ name: 'test' }));
  });

  it('given a failing post and onError callback, when mutate runs, then isError is true with error status 500, pending and mutating false, data null, and onError was invoked with the error', async () => {
    const error = new Error('Server error');
    mock.onPost('/test').reply(500, { message: 'Server error' });

    const onError = vi.fn();
    const mutation = useMutation({
      fn: () => agent.post('/test'),
      onError,
    });

    expect(mutation.isError).toBe(false);
    expect(mutation.error).toBe(null);

    await mutation.mutate();

    expect(mutation.isError).toBe(true);
    expect(mutation.error).toBeDefined();
    expect(mutation.error.response.status).toBe(500);
    expect(mutation.isPending).toBe(false);
    expect(mutation.isMutating).toBe(false);
    expect(mutation.data).toBe(null);
    expect(onError).toHaveBeenCalledWith(mutation.error);
    expect(mock.history.post.length).toBe(1);
  });

  it('given onMutate, onSuccess and onError handlers, when a successful mutate occurs, then onMutate is called first with args, onSuccess next with args, onError never called, and final data is set', async () => {
    const responseData = { id: 1 };
    mock.onPost('/test').reply(200, responseData, { 'content-type': 'application/json' });

    const onMutate = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    const onError = vi.fn().mockResolvedValue(undefined);
    const mutation = useMutation({
      fn: (data: any) => agent.post('/test', data),
      onMutate,
      onSuccess,
      onError,
    });

    const args = { name: 'test' };
    await mutation.mutate(args);

    expect(onMutate).toHaveBeenCalledWith(args);
    expect(onSuccess).toHaveBeenCalledWith(args);
    expect(onError).not.toHaveBeenCalled();
    expect(mutation.data).toEqual(responseData);
    expect(mock.history.post[0].data).toBe(JSON.stringify(args));
  });

  it('given two independent useMutation instances for different urls, when each is mutated, then each holds its own response data, requests are isolated per url, and re-mutating one does not affect the other', async () => {
    const responseData1 = { id: 1 };
    const responseData2 = { id: 2 };
    mock
      .onPost('/resource1')
      .reply(200, responseData1, { 'content-type': 'application/json' });
    mock
      .onPost('/resource2')
      .reply(200, responseData2, { 'content-type': 'application/json' });

    const mutation1 = useMutation({
      fn: (data: any) => agent.post('/resource1', data),
    });

    const mutation2 = useMutation({
      fn: (data: any) => agent.post('/resource2', data),
    });

    await mutation1.mutate({ name: 'first' });
    await mutation2.mutate({ name: 'second' });

    expect(mutation1.data).toEqual(responseData1);
    expect(mutation2.data).toEqual(responseData2);
    expect(mock.history.post[0].url).toBe('/resource1');
    expect(mock.history.post[0].data).toBe(JSON.stringify({ name: 'first' }));
    expect(mock.history.post[1].url).toBe('/resource2');
    expect(mock.history.post[1].data).toBe(JSON.stringify({ name: 'second' }));
    expect(mock.history.post.length).toBe(2);

    // Mutate only mutation1 again
    mock.onPost('/resource1').reply(200, responseData1, { 'content-type': 'application/json' });
    await mutation1.mutate({ name: 'first-again' });

    expect(mutation1.data).toEqual(responseData1);
    expect(mutation2.data).toEqual(responseData2); // Unchanged
    expect(mock.history.post[2].url).toBe('/resource1');
    expect(mock.history.post.length).toBe(3);
  });

  it('given initialData on mutation setup, when mutate completes with real data, then data is updated to server response and isPlaceholderData is set to false', async () => {
    const initialData = { placeholder: true };
    const responseData = { id: 1 };
    mock.onPost('/test').reply(200, responseData, { 'content-type': 'application/json' });

    const mutation = useMutation({
      fn: () => agent.post('/test'),
      initialData,
    });

    expect(mutation.data).toEqual(initialData);
    expect(mutation.isPlaceholderData).toBe(true);

    await mutation.mutate();

    expect(mutation.data).toEqual(responseData);
    expect(mutation.isPlaceholderData).toBe(false);
  });

  it('given onMutate, onSuccess, onError for failing request, when mutate is called, then onMutate called, onError called with error, onSuccess also called with args, and request count is one', async () => {
    mock.onPost('/test').reply(500, { message: 'Server error' });

    const onMutate = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    const onError = vi.fn().mockResolvedValue(undefined);
    const mutation = useMutation({
      fn: () => agent.post('/test'),
      onMutate,
      onSuccess,
      onError,
    });

    const args = { name: 'test' };
    await mutation.mutate(args);

    expect(onMutate).toHaveBeenCalledWith(args);
    expect(onError).toHaveBeenCalledWith(mutation.error);
    expect(onSuccess).toHaveBeenCalledWith(args);
    expect(mock.history.post.length).toBe(1);
  });
});
