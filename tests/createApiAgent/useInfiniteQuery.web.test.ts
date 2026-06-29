import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInfiniteQuery } from '../../src/api';

describe('given useInfiniteQuery, when fetching pages, then page data, params, and lifecycle state stay in sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('given an immediate infinite query, when the first page resolves and next page is fetched, then pages append in order', async () => {
    const fn = vi.fn()
      .mockResolvedValueOnce({ data: [{ id: 1 }], status: 200, pagination: { current: 1, of: 2 } } as any)
      .mockResolvedValueOnce({ data: [{ id: 2 }], status: 200, pagination: { current: 2, of: 2 } } as any);

    const query = useInfiniteQuery({
      initialPageParam: 1,
      fn,
    });

    expect(query.status).toBe('pending');
    expect(query.fetchStatus).toBe('fetching');
    expect(query.isLoading).toBe(true);
    expect(query.pages).toEqual([]);

    await vi.waitFor(() => expect(query.pages).toEqual([[{ id: 1 }]]));

    expect(fn).toHaveBeenCalledWith(1);
    expect(query.status).toBe('success');
    expect(query.fetchStatus).toBe('idle');
    expect(query.responseStatus).toBe(200);
    expect(query.pageParams).toEqual([1]);
    expect(query.hasNextPage).toBe(true);

    const nextPromise = query.fetchNextPage();
    expect(query.isFetchingNextPage).toBe(true);
    expect(query.isFetching).toBe(true);

    await nextPromise;
    await vi.waitFor(() => expect(query.pages).toEqual([[{ id: 1 }], [{ id: 2 }]]));

    expect(fn).toHaveBeenCalledWith(2);
    expect(query.data).toEqual(query.pages);
    expect(query.pageParams).toEqual([1, 2]);
    expect(query.hasNextPage).toBe(false);
    expect(query.isFetchingNextPage).toBe(false);
    expect(query.isFetching).toBe(false);
  });

  it('given a custom getNextPageParam, when next pages are fetched, then the custom params are used', async () => {
    const fn = vi.fn()
      .mockResolvedValueOnce({ data: { cursor: 'a' }, status: 200 } as any)
      .mockResolvedValueOnce({ data: { cursor: 'b' }, status: 200 } as any);

    const query = useInfiniteQuery({
      initialPageParam: 'start',
      fn,
      getNextPageParam: (_lastPage, pages) => pages.length === 1 ? 'cursor-b' : undefined,
    });

    await vi.waitFor(() => expect(query.hasNextPage).toBe(true));
    await query.fetchNextPage();

    expect(fn).toHaveBeenNthCalledWith(1, 'start');
    expect(fn).toHaveBeenNthCalledWith(2, 'cursor-b');
    expect(query.pageParams).toEqual(['start', 'cursor-b']);
    expect(query.pages).toEqual([{ cursor: 'a' }, { cursor: 'b' }]);
    expect(query.hasNextPage).toBe(false);
  });

  it('given previous page support, when previous page is fetched, then pages prepend and previous state updates', async () => {
    const fn = vi.fn()
      .mockResolvedValueOnce({ data: ['page-2'], status: 200, pagination: { current: 2, of: 3 } } as any)
      .mockResolvedValueOnce({ data: ['page-1'], status: 200, pagination: { current: 1, of: 3 } } as any);

    const query = useInfiniteQuery({
      initialPageParam: 2,
      fn,
    });

    await vi.waitFor(() => expect(query.pages).toEqual([['page-2']]));

    expect(query.hasPreviousPage).toBe(true);
    expect(query.hasNextPage).toBe(true);

    const previousPromise = query.fetchPreviousPage();
    expect(query.isFetchingPreviousPage).toBe(true);
    expect(query.isFetching).toBe(true);

    await previousPromise;

    expect(fn).toHaveBeenNthCalledWith(1, 2);
    expect(fn).toHaveBeenNthCalledWith(2, 1);
    expect(query.pages).toEqual([['page-1'], ['page-2']]);
    expect(query.pageParams).toEqual([1, 2]);
    expect(query.hasPreviousPage).toBe(false);
    expect(query.hasNextPage).toBe(true);
    expect(query.isFetchingPreviousPage).toBe(false);
  });

  it('given custom getPreviousPageParam, when previous page is fetched, then the custom param is used', async () => {
    const fn = vi.fn()
      .mockResolvedValueOnce({ data: { cursor: 'b' }, status: 200 } as any)
      .mockResolvedValueOnce({ data: { cursor: 'a' }, status: 200 } as any);

    const query = useInfiniteQuery({
      initialPageParam: 'cursor-b',
      fn,
      getPreviousPageParam: (_firstPage, pages) => pages.length === 1 ? 'cursor-a' : undefined,
    });

    await vi.waitFor(() => expect(query.hasPreviousPage).toBe(true));
    await query.fetchPreviousPage();

    expect(fn).toHaveBeenNthCalledWith(1, 'cursor-b');
    expect(fn).toHaveBeenNthCalledWith(2, 'cursor-a');
    expect(query.pageParams).toEqual(['cursor-a', 'cursor-b']);
    expect(query.pages).toEqual([{ cursor: 'a' }, { cursor: 'b' }]);
    expect(query.hasPreviousPage).toBe(false);
  });

  it('given immediate false, when fetch is called, then the first page is fetched manually', async () => {
    const fn = vi.fn().mockResolvedValue({ data: ['first'], status: 204 } as any);
    const query = useInfiniteQuery({
      initialPageParam: 0,
      fn,
      immediate: false,
    });

    expect(query.status).toBe('pending');
    expect(query.fetchStatus).toBe('idle');
    expect(query.isPending).toBe(true);
    expect(query.isLoading).toBe(false);
    expect(fn).not.toHaveBeenCalled();

    await query.fetch();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(query.status).toBe('success');
    expect(query.responseStatus).toBe(204);
    expect(query.pages).toEqual([['first']]);
    expect(query.pageParams).toEqual([0]);
  });

  it('given a failed page fetch, when the request rejects, then error status and responseStatus are exposed', async () => {
    const error = { response: { status: 500 } };
    const fn = vi.fn().mockRejectedValue(error);
    const query = useInfiniteQuery({
      initialPageParam: 1,
      fn,
    });

    await vi.waitFor(() => expect(query.isError).toBe(true));

    expect(query.status).toBe('error');
    expect(query.fetchStatus).toBe('idle');
    expect(query.responseStatus).toBe(500);
    expect(query.error).toBe(error);
    expect(query.pages).toEqual([]);
    expect(query.hasNextPage).toBe(false);
  });
});
