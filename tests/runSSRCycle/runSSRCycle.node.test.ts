import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createQueryCache } from '../../src/api/createQueryCache';
import { createSSRTracker } from '../../src/ssrUtils/ssrTracker';
import { runSSRCycle } from '../../src/ssrUtils/runSSRCycle';
import type { AxiosInstance } from 'axios';

let mockIsServer = false;

vi.mock('../../src/envs', () => ({
  get isServer() { return mockIsServer; },
}));

describe('given runSSRCycle', () => {
  let mockAgent: AxiosInstance;
  const renderCalls: Array<{ isStatic: boolean; phase: string }> = [];

  beforeEach(() => {
    mockIsServer = true;
    renderCalls.length = 0;
    mockAgent = {
      get: vi.fn().mockResolvedValue({
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      }),
    } as any;
  });

  it('when executed, then runs collect → resolve-tasks → collect → dehydrate → render phases in order', async () => {
    const resolveAsyncTasks = vi.fn().mockResolvedValue(undefined);
    const queryCache = createQueryCache();

    const result = await runSSRCycle({
      route: '/test',
      queryCache,
      resolveAsyncTasks,
      shouldAttemptStatic: true,
      render: async ({ isStatic, phase }) => {
        renderCalls.push({ isStatic, phase });
        if (phase === 'collect') {
          await queryCache.set('/api/data', mockAgent, { queryKey: ['data'] });
        }
        return `<html>${phase}-${isStatic}</html>`;
      },
    });

    expect(resolveAsyncTasks).toHaveBeenCalledTimes(1);
    expect(renderCalls.map(c => c.phase)).toEqual([
      'collect',
      'collect',
      'render',
    ]);
    expect(result.phases).toEqual([
      'collect',
      'resolve-tasks',
      'collect',
      'dehydrate',
      'render',
    ]);
    expect(result.snapshot).toBeTruthy();
    expect(result.html).toContain('render-true');
    expect(result.attemptedStatic).toBe(true);
    expect(result.downgraded).toBe(false);
  });

  it('when tracker reports dynamic during static attempt, then downgrades and rerenders dynamic', async () => {
    const tracker = createSSRTracker({ route: '/dynamic' });
    tracker.markDynamic('cookies');

    const result = await runSSRCycle({
      tracker,
      shouldAttemptStatic: true,
      render: async ({ isStatic, phase }) => `<html>${phase}:${isStatic}</html>`,
    });

    expect(result.downgraded).toBe(true);
    expect(result.isStatic).toBe(false);
    expect(result.html).toBe('<html>render:false</html>');
    expect(result.phases.filter(p => p === 'render')).toHaveLength(2);
  });

  it('when onStaticProven provided and static proven, then invokes callback', async () => {
    const onStaticProven = vi.fn();

    await runSSRCycle({
      shouldAttemptStatic: true,
      onStaticProven,
      render: async () => '<html>static</html>',
    });

    expect(onStaticProven).toHaveBeenCalledTimes(1);
    expect(onStaticProven.mock.calls[0][0].attemptedStatic).toBe(true);
    expect(onStaticProven.mock.calls[0][0].downgraded).toBe(false);
  });

  it('when queryCache provided, then resets cache before collection', async () => {
    mockIsServer = false;
    const queryCache = createQueryCache();
    await queryCache.set('/stale', mockAgent, { queryKey: ['stale'] });
    expect(queryCache.has('["stale"]')).toBe(true);

    mockIsServer = true;
    await runSSRCycle({
      queryCache,
      render: async () => '<html></html>',
    });

    expect(queryCache.has('["stale"]')).toBe(false);
  });
});