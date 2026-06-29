import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAnchors } from '../../../src/portals/anchorsSetup/generateAnchors';
import { assign } from '../../../src/assign';
import { ELEMENTS_SCOPE } from '../../../src/createIdCache';

vi.mock('../../../src/assign', () => ({
  assign: vi.fn((target, path, value) => {
    // Simple mock implementation for nested assignment
    const parts = path.split('.');
    let obj = target;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    return target;
  }),
}));

vi.mock('../../../src/createIdCache', () => ({
  currentIdCache: {
    getId: vi.fn((scope) => `id-${Math.floor(Math.random() * 10000)}`),
  },
  ELEMENTS_SCOPE: 'elements',
}));

describe('given the generateAnchors function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('given an array of simple anchor names, when generateAnchors is called, then it generates unique IDs for each', () => {
    const anchors = ['modal', 'tooltip', 'drawer'];

    const result = generateAnchors(anchors);

    expect(result).toHaveProperty('modal');
    expect(result).toHaveProperty('tooltip');
    expect(result).toHaveProperty('drawer');

    expect(result.modal).toMatch(/^modalid-\d+$/);
    expect(result.tooltip).toMatch(/^tooltipid-\d+$/);
  });

  it('given anchors with nested dot paths, when generateAnchors is called, then it correctly creates nested objects with unique IDs', () => {
    const anchors = ['modal.confirm', 'modal.cancel', 'user.profile.avatar'];

    const result: Record<string, any> = generateAnchors(anchors);

    expect(result.modal.confirm).toMatch(/^confirmid-\d+$/);
    expect(result.modal.cancel).toMatch(/^cancelid-\d+$/);
    expect(result.user.profile.avatar).toMatch(/^avatarid-\d+$/);
  });

  it('given an anchors array containing duplicates, when generateAnchors is called, then it returns only unique anchors', () => {
    const anchors = ['modal', 'tooltip', 'modal', 'drawer', 'tooltip'];

    const result = generateAnchors(anchors);

    expect(Object.keys(result)).toHaveLength(3);
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['modal', 'tooltip', 'drawer']));
  });

  it('given a custom idCache, when generateAnchors is called with it, then it uses the provided cache instead of the default', () => {
    const mockIdCache = {
      getId: vi.fn(() => 'custom-999'),
    };

    const result = generateAnchors(['modal'], mockIdCache as any);

    expect(result.modal).toBe('modalcustom-999');
    expect(mockIdCache.getId).toHaveBeenCalledWith(ELEMENTS_SCOPE);
  });

  it('given anchors with dot paths, when generateAnchors is called, then it calls assign with the correct target, path, and generated ID', () => {
    const anchors = ['modal.confirm', 'sidebar.menu'];

    generateAnchors(anchors);

    expect(assign).toHaveBeenCalledTimes(2);

    // Check one of the calls
    expect(assign).toHaveBeenCalledWith(
      expect.any(Object),
      'modal.confirm',
      expect.stringMatching(/^confirmid-\d+$/)
    );
  });

  it('given an empty array or undefined anchors, when generateAnchors is called, then it returns an empty object', () => {
    expect(generateAnchors([])).toEqual({});
    expect(generateAnchors(undefined as any)).toEqual({});
  });

  it('given the same anchors, when generateAnchors is called multiple times, then it generates different IDs each time', () => {
    const result1 = generateAnchors(['modal']);
    const result2 = generateAnchors(['modal']);

    expect(result1.modal).not.toBe(result2.modal);
  });
});
