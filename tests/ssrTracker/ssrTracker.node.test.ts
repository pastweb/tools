import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createSSRTracker,
  createDependencyFingerprint,
  setCurrentSSRTracker,
  clearCurrentSSRTracker,
  reportApiSSRToTracker,
} from '../../src/ssrUtils/ssrTracker';

let mockIsServer = false;

vi.mock('../../src/envs', () => ({
  get isServer() { return mockIsServer; },
}));

describe('given SSR tracker utilities', () => {
  beforeEach(() => {
    mockIsServer = true;
    clearCurrentSSRTracker();
  });

  afterEach(() => {
    clearCurrentSSRTracker();
    mockIsServer = false;
  });

  it('when createDependencyFingerprint called, then returns sorted stable key', () => {
    const tracker = createSSRTracker();
    tracker.addDependency({ type: 'api', key: 'b' });
    tracker.addDependency({ type: 'api', key: 'a' });

    const fp1 = createDependencyFingerprint(tracker.snapshot());
    const fp2 = createDependencyFingerprint(tracker.snapshot());

    expect(fp1).toBe('api:a|api:b');
    expect(fp1).toBe(fp2);
  });

  it('when reportApiSSRToTracker with ssrMode dynamic, then marks tracker dynamic', () => {
    const tracker = createSSRTracker();
    setCurrentSSRTracker(tracker);

    reportApiSSRToTracker('/api/me', { queryKey: ['me'], ssrMode: 'dynamic' });

    expect(tracker.isDynamic).toBe(true);
    expect(tracker.reasons.has('api:["me"]:dynamic')).toBe(true);
  });

  it('when reportApiSSRToTracker with ssrMode static, then adds dependency', () => {
    const tracker = createSSRTracker();
    setCurrentSSRTracker(tracker);

    reportApiSSRToTracker('/api/posts', {
      queryKey: ['posts'],
      ssrMode: 'static',
      ssrRevalitate: '5m',
    });

    const deps = Array.from(tracker.dependencies.values());
    expect(deps).toHaveLength(1);
    expect(deps[0].type).toBe('api');
    expect(deps[0].cacheKey).toBe('["posts"]');
    expect(deps[0].ssrMode).toBe('static');
    expect(deps[0].revalidate).toBe(300_000);
  });

  it('when reportApiSSRToTracker with ssrRevalitate false, then preserves false revalidation', () => {
    const tracker = createSSRTracker();
    setCurrentSSRTracker(tracker);

    reportApiSSRToTracker('/api/posts', {
      queryKey: ['posts'],
      ssrMode: 'static',
      ssrRevalitate: false,
    });

    const deps = Array.from(tracker.dependencies.values());
    expect(deps).toHaveLength(1);
    expect(deps[0].revalidate).toBe(false);
  });
});
