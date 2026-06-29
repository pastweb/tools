import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMutation } from '../../src/api';

describe('given useMutation retry support', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('given retry as a number, when mutation fails once then succeeds, then data is populated and onError is not called', async () => {
    const onError = vi.fn();
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValueOnce({ data: { saved: true } });

    const mutation = useMutation({
      fn,
      retry: 1,
      retryDelay: 0,
      onError,
    });

    await mutation.mutate({ id: 1 });

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, { id: 1 });
    expect(fn).toHaveBeenNthCalledWith(2, { id: 1 });
    expect(mutation.data).toEqual({ saved: true });
    expect(mutation.isError).toBe(false);
    expect(mutation.error).toBe(null);
    expect(onError).not.toHaveBeenCalled();
  });

  it('given retry as a predicate, when mutation keeps failing and predicate stops retrying, then onError receives the last error', async () => {
    const firstError = new Error('first failure');
    const secondError = new Error('second failure');
    const retry = vi.fn((failureCount: number) => failureCount < 2);
    const onError = vi.fn();
    const fn = vi.fn()
      .mockRejectedValueOnce(firstError)
      .mockRejectedValueOnce(secondError);

    const mutation = useMutation({
      fn,
      retry,
      retryDelay: 0,
      onError,
    });

    await mutation.mutate();

    expect(fn).toHaveBeenCalledTimes(2);
    expect(retry).toHaveBeenNthCalledWith(1, 1, firstError);
    expect(retry).toHaveBeenNthCalledWith(2, 2, secondError);
    expect(mutation.isError).toBe(true);
    expect(mutation.error).toBe(secondError);
    expect(onError).toHaveBeenCalledWith(secondError);
  });
});
