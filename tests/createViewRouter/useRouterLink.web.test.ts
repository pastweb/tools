import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createViewRouter } from '../../src/createViewRouter/createViewRouter';
import type { RouterOptions } from '../../src/createViewRouter/types';
import { effect } from '../../src/reactivity';
import { createMediatorContextUtils, type ContextUtils } from '../../src/globalContext';
import { ROUTER_CONTEXT_KEY } from '../../src/createViewRouter/constants';
import { useRouterLink } from '../../src/createViewRouter/useRouterLink/useRouterLink';

vi.useFakeTimers();

describe('useRouterLink', () => {
  let options: RouterOptions;

  beforeEach(() => {
    options = {
      base: '/',
      debug: false,
      routes: [
        { path: '/', view: 'Home' },
        { path: '/about', view: 'About' },
        { path: '/user/:name', view: 'User' },
      ],
      preloader: vi.fn(),
      RouterView: vi.fn(),
      beforeRouteParse: vi.fn(route => route),
      beforeRouteSelect: vi.fn(route => route),
      sensitive: false,
    };
  });

  it('given useRouterLink is called inside a mediator with a target path, when the current route changes to match or unmatch, then isActive and isExactActive update reactively and effects can observe them', async () => {
    const router = createViewRouter(options);
    await router.ready;

    const context = {
      getContext: vi.fn((key: string) => {
        if (key === ROUTER_CONTEXT_KEY) return router;
        return undefined;
      }),
      setContext: vi.fn(),
    };

    let capturedLink: ReturnType<typeof useRouterLink> | undefined;

    const mediator = () => {
      capturedLink = useRouterLink({ path: '/about' });
      return capturedLink;
    };

    createMediatorContextUtils(mediator, {}, {}, context as ContextUtils);

    expect(capturedLink).toBeDefined();
    expect(capturedLink!.pathname).toBe('/about');
    expect(capturedLink!.isActive).toBe(false);
    expect(capturedLink!.isExactActive).toBe(false);

    const activeStates: boolean[] = [];
    effect(() => {
      if (capturedLink) {
        activeStates.push(capturedLink.isActive);
      }
    });

    // Initial state captured via effect
    expect(activeStates[0]).toBe(false);

    // Navigate to /about using setRequest (SSR-friendly in tests)
    const fakeReq = {
      url: 'http://localhost:3000/about',
      method: 'GET',
      headers: {},
    } as any;

    await router.setRequest(fakeReq);
    vi.advanceTimersByTime(50);

    expect(capturedLink!.isActive).toBe(true);
    expect(capturedLink!.isExactActive).toBe(true);
    expect(activeStates).toContain(true);

    // Navigate away
    const homeReq = {
      url: 'http://localhost:3000/',
      method: 'GET',
      headers: {},
    } as any;

    await router.setRequest(homeReq);
    vi.advanceTimersByTime(50);

    expect(capturedLink!.isActive).toBe(false);
    expect(capturedLink!.isExactActive).toBe(false);
  });

  it('given useRouterLink is called with params, searchParams and hash options inside a mediator, when the link is created, then the resulting pathname includes the serialized extras', async () => {
    const router = createViewRouter(options);
    await router.ready;

    const context = {
      getContext: vi.fn((key: string) => {
        if (key === ROUTER_CONTEXT_KEY) return router;
        return undefined;
      }),
      setContext: vi.fn(),
    };

    let capturedLink: ReturnType<typeof useRouterLink> | undefined;

    const searchParams = new URLSearchParams('q=test');
    const mediator = () => {
      capturedLink = useRouterLink({
        path: '/about',
        searchParams,
        hash: 'top',
      });
      return capturedLink;
    };

    createMediatorContextUtils(mediator, {}, {}, context as ContextUtils);

    // getRouterLink builds the final pathname from the provided options.
    // We verify it accepted the options and the resulting pathname contains the extras.
    expect(capturedLink!.pathname).toContain('/about');
    expect(capturedLink!.pathname).toContain('q=test');
    expect(capturedLink!.pathname).toContain('#top');
  });

  it('given a RouterLink captured from useRouterLink, when its .navigate method is called, then it does not throw and can be used for navigation', async () => {
    const router = createViewRouter(options);
    await router.ready;

    const context = {
      getContext: vi.fn((key: string) => {
        if (key === ROUTER_CONTEXT_KEY) return router;
        return undefined;
      }),
      setContext: vi.fn(),
    };

    let capturedLink: ReturnType<typeof useRouterLink> | undefined;

    const mediator = () => {
      capturedLink = useRouterLink({ path: '/about' });
      return capturedLink;
    };

    createMediatorContextUtils(mediator, {}, {}, context as ContextUtils);

    // The navigate on the link is a callable function (it delegates to the router's navigation)
    expect(typeof capturedLink!.navigate).toBe('function');

    // Calling it should not throw. (We don't spy the internal closure here;
    // side effects can be verified via router state in more advanced tests.)
    expect(() => capturedLink!.navigate()).not.toThrow();
    expect(() => capturedLink!.navigate('/other')).not.toThrow();
  });

  it('given no active mediator context, when useRouterLink is called directly, then it throws the getContextUtils mediator error', () => {
    expect(() => useRouterLink({ path: '/about' })).toThrow(
      'getContextUtils() can only be called synchronously inside a mediator function body.'
    );
  });

  it('given a mediator context with no router, when useRouterLink is called inside the mediator, then it throws the missing ViewRouter context error', () => {
    const context = {
      getContext: vi.fn(() => undefined),
      setContext: vi.fn(),
    };

    const mediator = () => {
      useRouterLink({ path: '/about' });
    };

    expect(() =>
      createMediatorContextUtils(mediator, {}, {}, context as ContextUtils)
    ).toThrow(
      'useRouter must be called within a ViewRouter context.\nMake sure the ViewRouter is properly set up in the Global Context.'
    );
  });
});
