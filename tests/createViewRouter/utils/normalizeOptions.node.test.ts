import { describe, it, expect } from 'vitest';
import { normalizeOptions } from '../../../src/createViewRouter/utils';

describe('normalizeOptions', () => {
  const routes = [{ path: '/' }];

  it('given partial RouterOptions, when normalizeOptions is called, then sensible defaults are applied for missing fields like base and sensitive', () => {
    const normalized = normalizeOptions({ routes });
    expect(normalized.base).toBe('');
    expect(normalized.debug).toBe(false);
    expect(normalized.sensitive).toBe(false);
    expect(normalized.history).toBeUndefined(); // in node/SSR
    expect(normalized.routes).toBe(routes);
  });

  it('given fully specified options, when normalized, then user-provided values are kept as-is', () => {
    const history = {} as any;
    const normalized = normalizeOptions({
      routes,
      base: '/app',
      debug: true,
      history,
      sensitive: true,
      preloader: () => {},
      RouterView: () => {},
    });
    expect(normalized.base).toBe('/app');
    expect(normalized.debug).toBe(true);
    expect(normalized.history).toBe(history);
    expect(normalized.sensitive).toBe(true);
  });

  it('given beforeRouteParse or beforeRouteSelect hooks, when present in options, then they are preserved on the normalized result', () => {
    const beforeParse = () => {};
    const beforeSelect = () => {};
    const normalized = normalizeOptions({
      routes,
      beforeRouteParse: beforeParse,
      beforeRouteSelect: beforeSelect,
    });
    expect(normalized.beforeRouteParse).toBe(beforeParse);
    expect(normalized.beforeRouteSelect).toBe(beforeSelect);
  });
});
