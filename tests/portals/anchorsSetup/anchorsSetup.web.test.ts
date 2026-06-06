import { describe, it, expect, vi, beforeEach } from 'vitest';
import { anchorsSetup } from '../../../src/portals/anchorsSetup';
import { setCurrentIdCache, setCurrentPortalsCache } from '../../../src';
import { createPortal } from '../../../src/portals/createPortal';

vi.mock('../createPortal', () => ({
  createPortal: vi.fn(() => ({
    getPortalElement: vi.fn(),
    open: vi.fn(),
    update: vi.fn(),
    close: vi.fn(),
    remove: vi.fn(),
    setOnRemove: vi.fn(),
  })),
}));

vi.mock('../../createIdCache', () => ({
  currentIdCache: {
    getId: vi.fn(() => 'id-123'),
    removeId: vi.fn(),
  },
  setCurrentIdCache: vi.fn(),
  ELEMENTS_SCOPE: 'elements',
}));

vi.mock('../setCurrentPortalsCache', () => ({
  currentPortalsCache: {},
  setCurrentPortalsCache: vi.fn(),
}));

describe('anchorsSetup', () => {
  let mockGetEntry: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetEntry = vi.fn(() => ({}));
  });

  it('creates portal functions for each anchor', () => {
    const anchorIds = {
      modal: 'modal-root',
      tooltip: 'tooltip-root',
      drawer: 'drawer-root',
    };

    const result = anchorsSetup(mockGetEntry, anchorIds);

    expect(result).toHaveProperty('modal');
    expect(result).toHaveProperty('tooltip');
    expect(result).toHaveProperty('drawer');

    expect(typeof result.modal).toBe('function');
    expect(typeof result.tooltip).toBe('function');
  });

  it('each portal function has required methods', () => {
    const anchorIds = { modal: 'modal-root' };
    const result = anchorsSetup(mockGetEntry, anchorIds);

    const portalFn = result.modal;

    expect(typeof portalFn.update).toBe('function');
    expect(typeof portalFn.close).toBe('function');
    expect(typeof portalFn.remove).toBe('function');
  });

  it('throws error when anchors contain nested objects', () => {
    const invalidAnchors = {
      modal: 'modal-root',
      group: {
        tooltip: 'tooltip-root',
      },
    };

    expect(() => anchorsSetup(mockGetEntry, invalidAnchors as any)).toThrow(
      'Portals setup error - The anchors and descriptors Object cannot be a nested object.'
    );
  });
});
