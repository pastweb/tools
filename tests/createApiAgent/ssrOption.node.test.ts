import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApiAgent } from '../../src/api/createApiAgent';
import { createQueryCache } from '../../src/api/createQueryCache';
import { createSSRTracker, setCurrentSSRTracker, clearCurrentSSRTracker } from '../../src/ssrUtils/ssrTracker';

let mockIsServer = false;

vi.mock('../../src/envs', () => ({
  get isServer() { return mockIsServer; },
}));

describe('given agent.get ssrMode option', () => {
  beforeEach(() => {
    mockIsServer = true;
    clearCurrentSSRTracker();
  });

  afterEach(() => {
    clearCurrentSSRTracker();
    mockIsServer = false;
  });

  it('when ssrMode dynamic, then reports to active SSR tracker', async () => {
    const tracker = createSSRTracker();
    setCurrentSSRTracker(tracker);

    const queryCache = createQueryCache();
    const agent = createApiAgent({ queryCache });
    const getSpy = vi.spyOn(agent.agent, 'get').mockResolvedValue({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    } as any);

    await agent.get('/api/user', { queryKey: ['user'], ssrMode: 'dynamic' });

    expect(tracker.isDynamic).toBe(true);
    expect(getSpy).not.toHaveBeenCalled();
  });

  it('when ssrMode static, then adds tracker dependency without marking dynamic', async () => {
    const tracker = createSSRTracker();
    setCurrentSSRTracker(tracker);

    const queryCache = createQueryCache();
    const agent = createApiAgent({ queryCache });

    await agent.get('/api/posts', {
      queryKey: ['posts'],
      ssrMode: 'static',
      ssrRevalitate: '5m',
    });

    expect(tracker.isDynamic).toBe(false);
    expect(tracker.dependencies.size).toBe(1);
    expect(Array.from(tracker.dependencies.values())[0].revalidate).toBe(300_000);
  });
});
