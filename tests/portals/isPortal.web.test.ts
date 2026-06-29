import { describe, it, expect } from 'vitest';
import { isPortal } from '../../src/portals/isPortal';
import { createPortal } from '../../src/portals/createPortal';

describe('given the isPortal function', () => {
  it('given a portal created with createPortal, when isPortal is called, then it returns true', () => {
    const portal = createPortal();
    expect(isPortal(portal)).toBe(true);
  });

  it('given non-object values like null, undefined, primitives or functions, when isPortal is called, then it returns false', () => {
    expect(isPortal(null)).toBe(false);
    expect(isPortal(undefined)).toBe(false);
    expect(isPortal(42)).toBe(false);
    expect(isPortal('string')).toBe(false);
    expect(isPortal(true)).toBe(false);
    expect(isPortal(() => {})).toBe(false);
  });

  it('given plain objects without the PORTAL symbol, when isPortal is called, then it returns false', () => {
    expect(isPortal({})).toBe(false);
    expect(isPortal({ someProp: 'value' })).toBe(false);
  });

  it('given objects with portal-like methods but without the PORTAL symbol, when isPortal is called, then it returns false', () => {
    const fakePortal = {
      open: () => {},
      close: () => {},
      update: () => {},
      remove: () => {},
    };

    expect(isPortal(fakePortal)).toBe(false);
  });

  it('given an object with a PORTAL-like key that is not the correct symbol, when isPortal is called, then it returns false', () => {
    const fake = {
      [Symbol()]: true,           // Wrong type (should be symbol)
      open: () => {},
    };

    expect(isPortal(fake)).toBe(false);
  });

  it('given a portal created with a custom entry factory, when isPortal is called, then it returns true', () => {
    const entryFactory = () => ({} as any);
    const portal = createPortal(entryFactory);

    expect(isPortal(portal)).toBe(true);
  });

  it('given multiple portals created with createPortal, when isPortal is called on each, then it returns true for all', () => {
    const portal1 = createPortal();
    const portal2 = createPortal();

    expect(isPortal(portal1)).toBe(true);
    expect(isPortal(portal2)).toBe(true);
  });

  it('given objects with misleading property names like portal or isPortal, when isPortal is called, then it returns false', () => {
    const obj = {
      portal: true,
      PORTAL: true,
      isPortal: true,
    };

    expect(isPortal(obj)).toBe(false);
  });
});
