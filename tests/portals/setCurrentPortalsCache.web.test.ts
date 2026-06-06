import { describe, it, expect, beforeEach } from 'vitest';
import { currentPortalsCache, setCurrentPortalsCache } from '../../src/portals/setCurrentPortalsCache';
import type { Portals } from '../../src/portals/types';

describe('currentPortalsCache & setCurrentPortalsCache', () => {
  beforeEach(() => {
    // Reset to initial state before each test
    setCurrentPortalsCache({});
  });

  it('has an empty object as initial value', () => {
    expect(currentPortalsCache).toEqual({});
    expect(Object.keys(currentPortalsCache)).toHaveLength(0);
  });

  it('sets the currentPortalsCache to the provided value', () => {
    const newPortals: Portals = {
      modal: {
        'entry-1': true,
        'entry-2': {} as any,
      },
      tooltip: {
        'entry-tooltip-1': true,
      },
    };

    setCurrentPortalsCache(newPortals);

    expect(currentPortalsCache).toBe(newPortals); // same reference
    expect(currentPortalsCache).toEqual(newPortals);
  });

  it('overwrites previous cache when set again', () => {
    const portals1: Portals = { modal: { '1': true } };
    const portals2: Portals = { drawer: { '2': true } };

    setCurrentPortalsCache(portals1);
    expect(currentPortalsCache).toEqual(portals1);

    setCurrentPortalsCache(portals2);
    expect(currentPortalsCache).toEqual(portals2);
    expect(currentPortalsCache).not.toEqual(portals1);
  });

  it('assigns by reference (no deep clone)', () => {
    const originalPortals: Portals = {
      modal: { 'entry-1': true },
    };

    setCurrentPortalsCache(originalPortals);

    expect(currentPortalsCache).toBe(originalPortals); // strict equality

    // Modify original object
    originalPortals.modal['entry-2'] = true;

    expect(currentPortalsCache.modal['entry-2']).toBe(true);
  });

  it('can set an empty object', () => {
    setCurrentPortalsCache({});

    expect(currentPortalsCache).toEqual({});
    expect(Object.keys(currentPortalsCache)).toHaveLength(0);
  });

  it('can set complex nested portals structure', () => {
    const complexPortals: Portals = {
      modal: {
        'modal-1': { id: 'modal-1' } as any,
        'modal-2': true,
      },
      popover: {
        'popover-1': true,
      },
      'floating-menu': {
        'menu-1': true,
        'menu-2': true,
      },
    };

    setCurrentPortalsCache(complexPortals);

    expect(currentPortalsCache).toEqual(complexPortals);
    expect(currentPortalsCache['modal']).toBeDefined();
    expect(currentPortalsCache['floating-menu']).toBeDefined();
  });
});
