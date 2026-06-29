import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createViewRouter } from '../../src/createViewRouter/createViewRouter';
import type { RouterOptions } from '../../src/createViewRouter/types';
import { effect } from '../../src/reactivity';
import { createMediatorContextUtils, type ContextUtils } from '../../src/globalContext';
import { ROUTER_CONTEXT_KEY } from '../../src/createViewRouter/constants';
import { useSearchParams } from '../../src/createViewRouter/useSearchParams/useSearchParams';

vi.useFakeTimers();

describe('useSearchParams', () => {
  let options: RouterOptions;

  beforeEach(() => {
    options = {
      base: '/',
      debug: false,
      routes: [
        { path: '/', view: 'Home' },
        { path: '/search', view: 'Search' },
        { path: '/about', view: 'About' },
      ],
      preloader: vi.fn(),
      RouterView: vi.fn(),
      beforeRouteParse: vi.fn(route => route),
      beforeRouteSelect: vi.fn(route => route),
      sensitive: false,
    };
  });

  it('given useSearchParams is called inside a mediator, when setSearchParams is used or navigation updates search, then the reactive params updates and effects observing it receive the stringified changes', async () => {
    const router = createViewRouter(options);
    await router.ready;

    const context = {
      getContext: vi.fn((key: string) => {
        if (key === ROUTER_CONTEXT_KEY) return router;
        return undefined;
      }),
      setContext: vi.fn(),
    };

    let captured: ReturnType<typeof useSearchParams> | undefined;

    const mediator = () => {
      captured = useSearchParams();
      return captured;
    };

    createMediatorContextUtils(mediator, {}, {}, context as ContextUtils);

    expect(captured).toBeDefined();
    expect(captured!.params).toBeInstanceOf(URLSearchParams);
    expect(typeof captured!.setSearchParams).toBe('function');
    expect(captured!.params.toString()).toBe('');

    const searches: string[] = [];
    effect(() => {
      if (captured) {
        searches.push(captured.params.toString());
      }
    });

    // Initial
    expect(searches[0]).toBe('');

    // Simulate navigation with search params via router (or directly via the hook's setter)
    const next = new URLSearchParams({ q: 'hello', page: '2' });
    captured!.setSearchParams(next);
    vi.runAllTimers();

    expect(captured!.params.get('q')).toBe('hello');
    expect(captured!.params.get('page')).toBe('2');
    expect(searches).toContain('q=hello&page=2');

    // Change again
    const next2 = new URLSearchParams('filter=active');
    captured!.setSearchParams(next2);
    vi.runAllTimers();

    expect(captured!.params.toString()).toBe('filter=active');
    expect(searches).toContain('filter=active');
  });

  it('given a captured setSearchParams from the hook, when called with a new URLSearchParams, then the reactive params and the router location searchParams both reflect the update', async () => {
    const router = createViewRouter(options);
    await router.ready;

    const context = {
      getContext: vi.fn((key: string) => {
        if (key === ROUTER_CONTEXT_KEY) return router;
        return undefined;
      }),
      setContext: vi.fn(),
    };

    let captured: ReturnType<typeof useSearchParams> | undefined;

    const mediator = () => {
      captured = useSearchParams();
      return captured;
    };

    createMediatorContextUtils(mediator, {}, {}, context as ContextUtils);

    const sp = new URLSearchParams({ foo: 'bar' });
    captured!.setSearchParams(sp);
    vi.runAllTimers();

    expect(captured!.params.get('foo')).toBe('bar');
    // The router's location should also reflect it
    expect(router.location.searchParams.get('foo')).toBe('bar');
  });

  it('given no active mediator context, when useSearchParams is called directly, then it throws the getContextUtils mediator error', () => {
    expect(() => useSearchParams()).toThrow(
      'getContextUtils() can only be called synchronously inside a mediator function body.'
    );
  });

  it('given a mediator context with no router, when useSearchParams is called inside the mediator, then it throws the missing ViewRouter context error', () => {
    const context = {
      getContext: vi.fn(() => undefined),
      setContext: vi.fn(),
    };

    const mediator = () => {
      useSearchParams();
    };

    expect(() =>
      createMediatorContextUtils(mediator, {}, {}, context as ContextUtils)
    ).toThrow(
      'useRouter must be called within a ViewRouter context.\nMake sure the ViewRouter is properly set up in the Global Context.'
    );
  });
});
