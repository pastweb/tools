import { describe, it, expect } from 'vitest';
import { isPortal } from '../../src/portals/isPortal';
import { createPortal } from '../../src/portals/createPortal';

describe('isPortal', () => {
  it('returns true for a valid portal created with createPortal', () => {
    const portal = createPortal();
    expect(isPortal(portal)).toBe(true);
  });

  it('returns false for non-objects', () => {
    expect(isPortal(null)).toBe(false);
    expect(isPortal(undefined)).toBe(false);
    expect(isPortal(42)).toBe(false);
    expect(isPortal('string')).toBe(false);
    expect(isPortal(true)).toBe(false);
    expect(isPortal(() => {})).toBe(false);
  });

  it('returns false for plain objects', () => {
    expect(isPortal({})).toBe(false);
    expect(isPortal({ someProp: 'value' })).toBe(false);
  });

  it('returns false for objects that look similar but don\'t have the PORTAL symbol', () => {
    const fakePortal = {
      open: () => {},
      close: () => {},
      update: () => {},
      remove: () => {},
    };

    expect(isPortal(fakePortal)).toBe(false);
  });

  it('returns false if PORTAL key exists but is not the correct symbol', () => {
    const fake = {
      [Symbol()]: true,           // Wrong type (should be symbol)
      open: () => {},
    };

    expect(isPortal(fake)).toBe(false);
  });

  it('detects portal created with custom entry factory', () => {
    const entryFactory = () => ({} as any);
    const portal = createPortal(entryFactory);

    expect(isPortal(portal)).toBe(true);
  });

  it('works correctly with multiple portals', () => {
    const portal1 = createPortal();
    const portal2 = createPortal();

    expect(isPortal(portal1)).toBe(true);
    expect(isPortal(portal2)).toBe(true);
  });

  it('is robust against objects with similar property names', () => {
    const obj = {
      portal: true,
      PORTAL: true,
      isPortal: true,
    };

    expect(isPortal(obj)).toBe(false);
  });
});
