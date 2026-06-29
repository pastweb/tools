import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createViewRouter } from '../../src/createViewRouter/createViewRouter';
import type { RouterOptions } from '../../src/createViewRouter/types';
import { effect } from '../../src/reactivity';
import { createMediatorContextUtils, type ContextUtils } from '../../src/globalContext';
import { ROUTER_CONTEXT_KEY } from '../../src/createViewRouter/constants';
import { useRoute } from '../../src/createViewRouter/useRoute/useRoute';

vi.useFakeTimers();

describe('useRoute', () => {
  let options: RouterOptions;

  beforeEach(() => {
    options = {
      base: '/',
      debug: false,
      routes: [
        { path: '/', view: 'Home' },
        { path: '/about', view: 'About' },
        // Routes for testing optional and catch-all parameters
        { path: '/user/:name', view: 'User' },
        { path: '/user/:name/?:surname', view: 'UserOptional' },
        { path: '/user/:name/:surname?', view: 'UserOptionalAlt' },
        { path: '/blog/*slug', view: 'BlogPost' },
        { path: '/files/?*path', view: 'FileExplorer' },
        { path: '/dir/*files?', view: 'FileExplorerAlt' },
      ],
      preloader: vi.fn(),
      RouterView: vi.fn(),
      beforeRouteParse: vi.fn(route => route),
      beforeRouteSelect: vi.fn(route => route),
      sensitive: false,
    };
  });

  it('given useRoute is called inside a mediator context, when the current route changes, then the returned reactive SelectedRoute updates and effects observing .path receive the new route', async () => {
    const router = createViewRouter(options);
    await router.ready;

    const context = {
      getContext: vi.fn((key: string) => {
        if (key === ROUTER_CONTEXT_KEY) return router;
        return undefined;
      }),
      setContext: vi.fn(),
    };

    let capturedRoute: ReturnType<typeof useRoute> | undefined;

    const mediator = () => {
      capturedRoute = useRoute();
      return capturedRoute;
    };

    createMediatorContextUtils(mediator, {}, {}, context as ContextUtils);

    expect(capturedRoute).toBeDefined();

    const paths: string[] = [];
    effect(() => {
      if (capturedRoute) {
        paths.push(capturedRoute.path);
      }
    });

    // Initial value should be captured via the effect (may be resolved during router construction)
    expect(paths[0]).toBe('/');

    // Change route
    const fakeReq = {
      url: 'http://localhost:3000/about',
      method: 'GET',
      headers: {},
    } as any;

    await router.setRequest(fakeReq);
    vi.runAllTimers();

    expect(paths).toContain('/about');
    expect(capturedRoute!.path).toBe('/about');
  });

  it('given no active mediator context, when useRoute is called directly, then it throws the getContextUtils mediator error', () => {
    expect(() => useRoute()).toThrow(
      'getContextUtils() can only be called synchronously inside a mediator function body.'
    );
  });

  it('given a mediator context with no router registered, when useRoute is called inside the mediator, then it throws the missing ViewRouter context error', () => {
    const context = {
      getContext: vi.fn(() => undefined),
      setContext: vi.fn(),
    };

    const mediator = () => {
      useRoute();
    };

    expect(() =>
      createMediatorContextUtils(mediator, {}, {}, context as ContextUtils)
    ).toThrow(
      'useRouter must be called within a ViewRouter context.\nMake sure the ViewRouter is properly set up in the Global Context.'
    );
  });
});
