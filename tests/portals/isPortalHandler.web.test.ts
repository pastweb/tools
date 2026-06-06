import { describe, it, expect } from 'vitest';
import { isPortalHandler } from '../../src/portals/isPortalHaldler';
import { PORTAL_HANDLER } from '../../src/portals/constants';

describe('isPortalHandler', () => {
  it('returns true for a valid portal handler object', () => {
    const validHandler = {
      [PORTAL_HANDLER]: true,
      id: 'portal-123',
      open: () => {},
      close: () => {},
      update: () => {},
      remove: () => {},
      onRemove: () => {},
      getPortalElement: () => document.createElement('div'),
    };

    expect(isPortalHandler(validHandler)).toBe(true);
  });

  it('returns false for non-objects', () => {
    expect(isPortalHandler(null)).toBe(false);
    expect(isPortalHandler(undefined)).toBe(false);
    expect(isPortalHandler(123)).toBe(false);
    expect(isPortalHandler('string')).toBe(false);
    expect(isPortalHandler(true)).toBe(false);
    expect(isPortalHandler([])).toBe(false);
    expect(isPortalHandler(() => {})).toBe(false);
  });

  it('returns false for plain objects', () => {
    expect(isPortalHandler({})).toBe(false);
    expect(isPortalHandler({ id: '123', open: () => {} })).toBe(false);
  });

  it('returns false for objects that look similar but lack the PORTAL_HANDLER symbol', () => {
    const fakeHandler = {
      id: 'portal-xyz',
      open: () => {},
      close: () => {},
      update: () => {},
      remove: () => {},
      getPortalElement: () => document.createElement('div'),
    };

    expect(isPortalHandler(fakeHandler)).toBe(false);
  });

  it('returns false if PORTAL_HANDLER key exists but is not the correct symbol', () => {
    const fake = {
      [Symbol()]: true,        // Wrong value type
      id: '123',
      open: () => {},
    };

    expect(isPortalHandler(fake)).toBe(false);
  });

  it('is robust against objects with similarly named properties', () => {
    const misleading = {
      PORTAL_HANDLER: true,
      portalHandler: true,
      isPortalHandler: true,
      id: 'fake',
    };

    expect(isPortalHandler(misleading)).toBe(false);
  });

  it('works correctly with multiple different handlers', () => {
    const handler1 = { [PORTAL_HANDLER]: true, id: '1', open: () => {} };
    const handler2 = { [PORTAL_HANDLER]: true, id: '2', open: () => {} };

    expect(isPortalHandler(handler1)).toBe(true);
    expect(isPortalHandler(handler2)).toBe(true);
  });

  it('returns false for objects with other symbols', () => {
    const objWithSymbol = {
      [Symbol('other')]: true,
      open: () => {},
    };

    expect(isPortalHandler(objWithSymbol)).toBe(false);
  });
});
