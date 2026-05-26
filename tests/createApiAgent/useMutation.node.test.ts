import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { createApiAgent, useMutation } from '../../src/createApiAgent';
import type { AxiosResponse } from 'axios';

describe('useMutation with createApiAgent', () => {
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

  it('should initialize with correct default state', () => {
    const fn = vi.fn().mockResolvedValue({ data: { id: 1 } } as AxiosResponse);
    const mutation = useMutation({ fn });

    expect(mutation.isPending).toBe(false);
    expect(mutation.isMutating).toBe(false);
    expect(mutation.isError).toBe(false);
    expect(mutation.data).toBe(null);
    expect(mutation.error).toBe(null);
    expect(mutation.isPlaceholderData).toBe(false);
  });

  it('should initialize with initialData and isPlaceholderData true', () => {
    const initialData = { id: 0 };
    const fn = vi.fn().mockResolvedValue({ data: { id: 1 } } as AxiosResponse);
    const mutation = useMutation({ fn, initialData });

    expect(mutation.data).toEqual(initialData);
    expect(mutation.isPlaceholderData).toBe(true);
    expect(mutation.isPending).toBe(false);
    expect(mutation.isMutating).toBe(false);
  });

  it('should execute mutation with arguments and update state', async () => {
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

  it('should handle mutation error and call onError', async () => {
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

  it('should call lifecycle hooks in correct order', async () => {
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

  it('should maintain isolation between multiple mutations', async () => {
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

  it('should handle initialData and update isPlaceholderData after mutation', async () => {
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

  it('should call onError and onSuccess in correct order on error', async () => {
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
