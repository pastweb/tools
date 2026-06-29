import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useQuery } from '../../src/api';

describe('given useQuery retry support', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('given retry as a number, when the query fails twice then succeeds, then data is populated after retry attempts', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('first failure'))
      .mockRejectedValueOnce(new Error('second failure'))
      .mockResolvedValueOnce({ data: { ok: true } });

    const query = useQuery({
      fn,
      retry: 2,
      retryDelay: 0,
    });

    await vi.runAllTimersAsync();
    await vi.waitFor(() => expect(query.isFetching).toBe(false));

    expect(fn).toHaveBeenCalledTimes(3);
    expect(query.data).toEqual({ ok: true });
    expect(query.isError).toBe(false);
    expect(query.error).toBe(null);
    expect(query.isFetching).toBe(false);
  });

  it('given retry as a predicate and retryDelay as a function, when the predicate stops retrying, then the last error is exposed', async () => {
    const firstError = new Error('first failure');
    const secondError = new Error('second failure');
    const retry = vi.fn((failureCount: number) => failureCount < 2);
    const retryDelay = vi.fn(() => 0);
    const fn = vi.fn()
      .mockRejectedValueOnce(firstError)
      .mockRejectedValueOnce(secondError);

    const query = useQuery({
      fn,
      retry,
      retryDelay,
    });

    await vi.runAllTimersAsync();

    expect(fn).toHaveBeenCalledTimes(2);
    expect(retry).toHaveBeenNthCalledWith(1, 1, firstError);
    expect(retry).toHaveBeenNthCalledWith(2, 2, secondError);
    expect(retryDelay).toHaveBeenCalledWith(1, firstError);
    expect(query.isError).toBe(true);
    expect(query.error).toBe(secondError);
    expect(query.data).toBe(null);
    expect(query.isFetching).toBe(false);
  });
});
