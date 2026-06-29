import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createViewRouter } from '../../src/createViewRouter/createViewRouter';
import type { RouterOptions } from '../../src/createViewRouter/types';
import { effect } from '../../src/reactivity';
import { createMediatorContextUtils, type ContextUtils } from '../../src/globalContext';
import { ROUTER_CONTEXT_KEY } from '../../src/createViewRouter/constants';
import { usePaths } from '../../src/createViewRouter/usePaths/usePaths';

vi.useFakeTimers();

describe('usePaths', () => {
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

  it('given usePaths is called inside a mediator, when routes are added to the router, then the returned reactive array updates and effects can observe length and content changes directly', async () => {
    const router = createViewRouter(options);

    const context = {
      getContext: vi.fn((key: string) => {
        if (key === ROUTER_CONTEXT_KEY) return router;
        return undefined;
      }),
      setContext: vi.fn(),
    };

    let captured: ReturnType<typeof usePaths> | undefined;

    const mediator = () => {
      captured = usePaths();
      return captured;
    };

    createMediatorContextUtils(mediator, {}, {}, context as ContextUtils);

    expect(captured).toBeDefined();
    // usePaths now returns the reactive array directly (transparent proxy from computed, no .value wrapper)
    expect(Array.isArray(captured) || (captured && typeof captured.length === 'number')).toBe(true);
    const v = captured!;
    expect(v && typeof v.length === 'number').toBe(true);
    expect(v.length).toBe(8);

    // Add a route – the computed array should be recomputed
    const newRoute = { path: '/contact', view: 'Contact' };
    await router.addRoute(newRoute);
    vi.runAllTimers();

    expect(captured!.length).toBe(9);
    expect(captured!.some((r) => r.path === '/contact')).toBe(true);

    // Demonstrate that an effect attached directly to the captured array can observe it
    const lengths: number[] = [];
    effect(() => {
      if (captured) lengths.push(captured.length);
    });

    // The effect above has run (at least with the current value after first add)
    expect(lengths).toContain(9);
  });

  it('given usePaths is called with a filter option inside a mediator, when the hook returns, then only matching routes are present in the returned array', async () => {
    const router = createViewRouter(options);

    const context = {
      getContext: vi.fn((key: string) => {
        if (key === ROUTER_CONTEXT_KEY) return router;
        return undefined;
      }),
      setContext: vi.fn(),
    };

    let captured: ReturnType<typeof usePaths> | undefined;

    const mediator = () => {
      // Only keep routes that have a 'view' (filters out pure redirects if any)
      captured = usePaths({ view: (v: any) => !!v });
      return captured;
    };

    createMediatorContextUtils(mediator, {}, {}, context as ContextUtils);

    const v = captured!;
    expect(v.length).toBeGreaterThan(0);
    // All returned routes in this test data have a view
    expect(v.every((r) => 'view' in r || 'views' in r)).toBe(true);
  });

  it('given no active mediator context, when usePaths is called directly, then it throws the getContextUtils mediator error', () => {
    expect(() => usePaths()).toThrow(
      'getContextUtils() can only be called synchronously inside a mediator function body.'
    );
  });

  it('given a mediator context with no router, when usePaths is called inside the mediator, then it throws the missing ViewRouter context error', () => {
    const context = {
      getContext: vi.fn(() => undefined),
      setContext: vi.fn(),
    };

    const mediator = () => {
      usePaths();
    };

    expect(() =>
      createMediatorContextUtils(mediator, {}, {}, context as ContextUtils)
    ).toThrow(
      'useRouter must be called within a ViewRouter context.\nMake sure the ViewRouter is properly set up in the Global Context.'
    );
  });
});
