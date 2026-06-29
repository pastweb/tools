import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createViewRouter } from '../../src/createViewRouter/createViewRouter';
import type { RouterOptions } from '../../src/createViewRouter/types';
import { createMediatorContextUtils, type ContextUtils } from '../../src/globalContext';
import { ROUTER_CONTEXT_KEY } from '../../src/createViewRouter/constants';
import { useNavigate } from '../../src/createViewRouter/useNavigate/useNavigate';

describe('useNavigate', () => {
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

  it('given useNavigate is called inside a mediator context, when executed, then it returns the router.navigate function', async () => {
    const router = createViewRouter(options);

    const context = {
      getContext: vi.fn((key: string) => {
        if (key === ROUTER_CONTEXT_KEY) return router;
        return undefined;
      }),
      setContext: vi.fn(),
    };

    let capturedNavigate: ReturnType<typeof useNavigate> | undefined;

    const mediator = () => {
      capturedNavigate = useNavigate();
      return capturedNavigate;
    };

    createMediatorContextUtils(mediator, {}, {}, context as ContextUtils);

    expect(capturedNavigate).toBeDefined();
    expect(typeof capturedNavigate).toBe('function');

    // Verify it is the same function as on the router
    expect(capturedNavigate).toBe(router.navigate);
  });

  it('given a captured navigate function from useNavigate, when it is invoked with a path, then it delegates to the router history push', async () => {
    const history = {
      listen: vi.fn(),
      push: vi.fn(),
      replace: vi.fn(),
      go: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    } as any;

    const router = createViewRouter({ ...options, history });

    const context = {
      getContext: vi.fn((key: string) => {
        if (key === ROUTER_CONTEXT_KEY) return router;
        return undefined;
      }),
      setContext: vi.fn(),
    };

    let capturedNavigate: ReturnType<typeof useNavigate> | undefined;

    const mediator = () => {
      capturedNavigate = useNavigate();
      return capturedNavigate;
    };

    createMediatorContextUtils(mediator, {}, {}, context as ContextUtils);

    await capturedNavigate!('/about');

    expect(history.push).toHaveBeenCalledWith('/about', undefined);
  });

  it('given no active mediator context, when useNavigate is called directly, then it throws the getContextUtils mediator error', () => {
    expect(() => useNavigate()).toThrow(
      'getContextUtils() can only be called synchronously inside a mediator function body.'
    );
  });

  it('given a mediator context with no router registered, when useNavigate is called inside the mediator, then it throws the missing ViewRouter context error', () => {
    const context = {
      getContext: vi.fn(() => undefined),
      setContext: vi.fn(),
    };

    const mediator = () => {
      useNavigate();
    };

    expect(() =>
      createMediatorContextUtils(mediator, {}, {}, context as ContextUtils)
    ).toThrow(
      'useRouter must be called within a ViewRouter context.\nMake sure the ViewRouter is properly set up in the Global Context.'
    );
  });
});
