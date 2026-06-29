import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useQueries } from '../../src/api';

describe('given useQueries, when coordinating multiple useQuery configs, then child queries and aggregate state stay in sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('given multiple immediate queries, when they resolve, then data and aggregate flags are updated in input order', async () => {
    const usersFn = vi.fn().mockResolvedValue({ data: [{ id: 1 }] } as any);
    const postsFn = vi.fn().mockResolvedValue({ data: [{ id: 10 }] } as any);

    const queries = useQueries({
      queries: [
        { fn: usersFn },
        { fn: postsFn },
      ],
    });

    expect(queries.queries.length).toBe(2);
    expect(queries.status).toBe('pending');
    expect(queries.fetchStatus).toBe('fetching');
    expect(queries.isPending).toBe(true);
    expect(queries.isLoading).toBe(true);
    expect(queries.isFetching).toBe(true);
    expect(queries.isError).toBe(false);
    expect(queries.data).toEqual([null, null]);

    await vi.waitFor(() => expect(queries.data).toEqual([[{ id: 1 }], [{ id: 10 }]]));

    expect(queries.queries[0].data).toEqual([{ id: 1 }]);
    expect(queries.queries[1].data).toEqual([{ id: 10 }]);
    expect(queries.status).toBe('success');
    expect(queries.fetchStatus).toBe('idle');
    expect(queries.isPending).toBe(false);
    expect(queries.isLoading).toBe(false);
    expect(queries.isFetching).toBe(false);
    expect(queries.isError).toBe(false);
    expect(queries.errors).toEqual([null, null]);
  });

  it('given array-form configs with immediate false, when fetch is called, then all child queries run', async () => {
    const usersFn = vi.fn().mockResolvedValue({ data: [{ id: 1 }] } as any);
    const postsFn = vi.fn().mockResolvedValue({ data: [{ id: 2 }] } as any);

    const queries = useQueries([
      { fn: usersFn, immediate: false },
      { fn: postsFn, immediate: false },
    ] as const);

    expect(queries.status).toBe('pending');
    expect(queries.fetchStatus).toBe('idle');
    expect(queries.isPending).toBe(true);
    expect(queries.isLoading).toBe(false);
    expect(queries.isFetching).toBe(false);
    expect(usersFn).not.toHaveBeenCalled();
    expect(postsFn).not.toHaveBeenCalled();

    await queries.fetch();

    await vi.waitFor(() => expect(queries.data).toEqual([[{ id: 1 }], [{ id: 2 }]]));

    expect(usersFn).toHaveBeenCalledTimes(1);
    expect(postsFn).toHaveBeenCalledTimes(1);
    expect(queries.status).toBe('success');
    expect(queries.fetchStatus).toBe('idle');
    expect(queries.isPending).toBe(false);
    expect(queries.isFetching).toBe(false);
  });

  it('given one child query fails, when queries settle, then aggregate error state and errors preserve order', async () => {
    const error = new Error('posts failed');
    const usersFn = vi.fn().mockResolvedValue({ data: [{ id: 1 }] } as any);
    const postsFn = vi.fn().mockRejectedValue(error);

    const queries = useQueries({
      queries: [
        { fn: usersFn },
        { fn: postsFn },
      ],
    });

    await vi.waitFor(() => expect(queries.isError).toBe(true));

    expect(queries.status).toBe('error');
    expect(queries.fetchStatus).toBe('idle');
    expect(queries.data).toEqual([[{ id: 1 }], null]);
    expect(queries.isError).toBe(true);
    expect(queries.errors).toEqual([null, error]);
    expect(queries.queries[1].isError).toBe(true);
  });
});
