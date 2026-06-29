import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createViewRouter } from '../../src/createViewRouter/createViewRouter';
import type { RouterOptions } from '../../src/createViewRouter/types';
import { effect } from '../../src/reactivity';
import { createMediatorContextUtils, type ContextUtils } from '../../src/globalContext';
import { ROUTER_CONTEXT_KEY } from '../../src/createViewRouter/constants';
import { useLocation } from '../../src/createViewRouter/useLocation/useLocation';

vi.useFakeTimers();

describe('useLocation', () => {
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

  it('given useLocation is called inside a mediator context, when the router location changes via setRequest, then the returned reactive location updates and effects observing it receive the changes', async () => {
    const router = createViewRouter(options);

    const context = {
      getContext: vi.fn((key: string) => {
        if (key === ROUTER_CONTEXT_KEY) return router;
        return undefined;
      }),
      setContext: vi.fn(),
    };

    let capturedLocation: ReturnType<typeof useLocation> | undefined;

    const mediator = () => {
      capturedLocation = useLocation();
      return capturedLocation;
    };

    createMediatorContextUtils(mediator, {}, {}, context as ContextUtils);

    expect(capturedLocation).toBeDefined();

    const paths: string[] = [];
    effect(() => {
      if (capturedLocation) {
        paths.push(capturedLocation.pathname);
      }
    });

    // Initial value should be captured
    expect(paths[0]).toBe('/');

    // Change location via setRequest (the computed proxy for location will reflect it on next access / effect run)
    const fakeReq = {
      url: 'http://localhost:3000/about',
      method: 'GET',
      headers: {},
    } as any;

    await router.setRequest(fakeReq);
    vi.runAllTimers();

    expect(paths).toContain('/about');
    expect(capturedLocation?.pathname).toBe('/about');
  });
});
