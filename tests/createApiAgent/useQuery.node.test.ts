import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApiAgent, useQuery } from '../../src/createApiAgent';
import { ref } from '../../src/reactivity';

// Force SSR mode
vi.mock('../isSSR', () => ({
  isSSR: true,
}));

describe('useQuery (SSR)', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // Mock Atomics
    vi.spyOn(Atomics, 'wait').mockReturnValue('ok');
    vi.spyOn(Atomics, 'store').mockImplementation(() => 1n);
    vi.spyOn(Atomics, 'notify').mockImplementation(() => 1);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should call initSharedBuffer and Atomics when SSRWait = true', async () => {
    const fn = vi.fn().mockResolvedValue({ data: { id: 1 } });

    const query = useQuery({ fn, immediate: true, SSRWait: true });

    await vi.runAllTimersAsync();

    expect(Atomics.store).toHaveBeenCalled();
    expect(Atomics.notify).toHaveBeenCalled();
  });

  it('should resolve data correctly in SSR environment', async () => {
    const responseData = { id: 42, name: 'SSR Test' };
    
    const fn = vi.fn().mockResolvedValue({
      data: responseData,
      pagination: null,
      onData: vi.fn(),
    });

    const query = useQuery({
      fn,
      immediate: true,
      SSRWait: true,
    });

    await vi.runAllTimersAsync();

    expect(query.data).toEqual(responseData);
    expect(query.isPending).toBe(false);
    expect(query.isFetching).toBe(false);
    expect(query.isError).toBe(false);
    expect(query.error).toBe(null);
  });

  it('should skip SharedArrayBuffer logic when SSRWait = false', async () => {
    const fn = vi.fn().mockResolvedValue({ data: { id: 1 } });

    const query = useQuery({
      fn,
      immediate: true,
      SSRWait: false,
    });

    await vi.runAllTimersAsync();

    expect(Atomics.store).not.toHaveBeenCalled();
    expect(Atomics.notify).not.toHaveBeenCalled();
  });
});
