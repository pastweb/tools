import { describe, it, expect, beforeEach } from 'vitest';
import { currentPortalsCache, setCurrentPortalsCache } from '../../src/portals/setCurrentPortalsCache';
import type { Portals } from '../../src/portals/types';

describe('given currentPortalsCache and setCurrentPortalsCache', () => {
  beforeEach(() => {
    // Reset to initial state before each test
    setCurrentPortalsCache({});
  });

  it('given the module is loaded, when checking currentPortalsCache before any sets, then it has an empty object as initial value', () => {
    expect(currentPortalsCache).toEqual({});
    expect(Object.keys(currentPortalsCache)).toHaveLength(0);
  });

  it('given new portals data, when setCurrentPortalsCache is called, then currentPortalsCache is set to the provided value by reference', () => {
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

  it('given an initial cache set, when setCurrentPortalsCache is called again with different value, then it overwrites the previous cache', () => {
    const portals1: Portals = { modal: { '1': true } };
    const portals2: Portals = { drawer: { '2': true } };

    setCurrentPortalsCache(portals1);
    expect(currentPortalsCache).toEqual(portals1);

    setCurrentPortalsCache(portals2);
    expect(currentPortalsCache).toEqual(portals2);
    expect(currentPortalsCache).not.toEqual(portals1);
  });

  it('given portals object, when setCurrentPortalsCache is called, then it assigns by reference with no deep clone', () => {
    const originalPortals: Portals = {
      modal: { 'entry-1': true },
    };

    setCurrentPortalsCache(originalPortals);

    expect(currentPortalsCache).toBe(originalPortals); // strict equality

    // Modify original object
    originalPortals.modal['entry-2'] = true;

    expect(currentPortalsCache.modal['entry-2']).toBe(true);
  });

  it('given an empty object, when setCurrentPortalsCache is called, then currentPortalsCache becomes empty', () => {
    setCurrentPortalsCache({});

    expect(currentPortalsCache).toEqual({});
    expect(Object.keys(currentPortalsCache)).toHaveLength(0);
  });

  it('given a complex nested portals structure, when setCurrentPortalsCache is called, then it sets and allows access to the nested data', () => {
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
