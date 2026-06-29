import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createViewRouter } from '../../src/createViewRouter/createViewRouter';
import type { RouterOptions } from '../../src/createViewRouter/types';
import { createMediatorContextUtils, type ContextUtils } from '../../src/globalContext';
import { ROUTER_CONTEXT_KEY } from '../../src/createViewRouter/constants';
import { useRouter } from '../../src/createViewRouter/useRouter/useRouter';

describe('useRouter', () => {
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

  it('given useRouter is called inside a mediator context, when executed, then it returns the exact same router instance from context', async () => {
    const router = createViewRouter(options);

    const context = {
      getContext: vi.fn((key: string) => {
        if (key === ROUTER_CONTEXT_KEY) return router;
        return undefined;
      }),
      setContext: vi.fn(),
    };

    let capturedRouter: ReturnType<typeof useRouter> | undefined;

    const mediator = () => {
      capturedRouter = useRouter();
      return capturedRouter;
    };

    createMediatorContextUtils(mediator, {}, {}, context as ContextUtils);

    expect(capturedRouter).toBeDefined();
    expect(capturedRouter).toBe(router);
  });

  it('given no active mediator context, when useRouter is called directly, then it throws the getContextUtils mediator error', () => {
    expect(() => useRouter()).toThrow(
      'getContextUtils() can only be called synchronously inside a mediator function body.'
    );
  });

  it('given a mediator context with no router, when useRouter is called inside the mediator, then it throws the missing ViewRouter context error', () => {
    const context = {
      getContext: vi.fn(() => undefined),
      setContext: vi.fn(),
    };

    const mediator = () => {
      useRouter();
    };

    expect(() =>
      createMediatorContextUtils(mediator, {}, {}, context as ContextUtils)
    ).toThrow(
      'useRouter must be called within a ViewRouter context.\nMake sure the ViewRouter is properly set up in the Global Context.'
    );
  });

  it('given the router captured via useRouter inside a mediator, when setRequest is called on it, then both the captured and global router reflect the new currentRoute reactively', async () => {
    const router = createViewRouter(options);

    const context = {
      getContext: vi.fn((key: string) => {
        if (key === ROUTER_CONTEXT_KEY) return router;
        return undefined;
      }),
      setContext: vi.fn(),
    };

    let capturedRouter: ReturnType<typeof useRouter> | undefined;

    const mediator = () => {
      capturedRouter = useRouter();
      return capturedRouter;
    };

    createMediatorContextUtils(mediator, {}, {}, context as ContextUtils);

    expect(capturedRouter).toBe(router);

    // Use the captured router (same as the original)
    const fakeReq = {
      url: 'http://localhost:3000/about',
      method: 'GET',
      headers: {},
    } as any;

    await capturedRouter.setRequest(fakeReq);

    expect(capturedRouter.currentRoute.path).toBe('/about');
    expect(router.currentRoute.path).toBe('/about'); // same instance
  });
});
