import { describe, it, expect } from 'vitest';
import { isPortalHandler } from '../../src/portals/isPortalHaldler';
import { PORTAL_HANDLER } from '../../src/portals/constants';

describe('given the isPortalHandler function', () => {
  it('given a valid handler object with PORTAL_HANDLER symbol, when isPortalHandler is called, then it returns true', () => {
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

  it('given non-object values, when isPortalHandler is called, then it returns false', () => {
    expect(isPortalHandler(null)).toBe(false);
    expect(isPortalHandler(undefined)).toBe(false);
    expect(isPortalHandler(123)).toBe(false);
    expect(isPortalHandler('string')).toBe(false);
    expect(isPortalHandler(true)).toBe(false);
    expect(isPortalHandler([])).toBe(false);
    expect(isPortalHandler(() => {})).toBe(false);
  });

  it('given plain objects without the PORTAL_HANDLER symbol, when isPortalHandler is called, then it returns false', () => {
    expect(isPortalHandler({})).toBe(false);
    expect(isPortalHandler({ id: '123', open: () => {} })).toBe(false);
  });

  it('given objects with handler-like methods but without the PORTAL_HANDLER symbol, when isPortalHandler is called, then it returns false', () => {
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

  it('given an object with a PORTAL_HANDLER-like key that is not the correct symbol, when isPortalHandler is called, then it returns false', () => {
    const fake = {
      [Symbol()]: true,        // Wrong value type
      id: '123',
      open: () => {},
    };

    expect(isPortalHandler(fake)).toBe(false);
  });

  it('given objects with misleading properties like PORTAL_HANDLER as plain key, when isPortalHandler is called, then it returns false', () => {
    const misleading = {
      PORTAL_HANDLER: true,
      portalHandler: true,
      isPortalHandler: true,
      id: 'fake',
    };

    expect(isPortalHandler(misleading)).toBe(false);
  });

  it('given multiple valid handlers, when isPortalHandler is called, then it returns true for each', () => {
    const handler1 = { [PORTAL_HANDLER]: true, id: '1', open: () => {} };
    const handler2 = { [PORTAL_HANDLER]: true, id: '2', open: () => {} };

    expect(isPortalHandler(handler1)).toBe(true);
    expect(isPortalHandler(handler2)).toBe(true);
  });

  it('given objects with other symbols but not PORTAL_HANDLER, when isPortalHandler is called, then it returns false', () => {
    const objWithSymbol = {
      [Symbol('other')]: true,
      open: () => {},
    };

    expect(isPortalHandler(objWithSymbol)).toBe(false);
  });
});
