import { describe, it, expect } from 'vitest';
import { setAsPortalHandler } from '../../src/portals/setAsPortalHandler';
import { PORTAL_HANDLER } from '../../src/portals/constants';
import type { PortalHandler } from '../../src/portals/types';

describe('setAsPortalHandler', () => {
  it('adds the PORTAL_HANDLER symbol to a valid object and returns it as PortalHandler', () => {
    const target = {
      id: 'portal-123',
      open: () => {},
      close: () => {},
      update: () => {},
      remove: () => {},
    };

    const result = setAsPortalHandler(target);

    expect(result).toBe(target); // should return the same object
    expect((result as any)[PORTAL_HANDLER]).toBe(true);
    expect(result).toHaveProperty('id');
  });

  it('makes the PORTAL_HANDLER property non-enumerable, non-writable, and non-configurable', () => {
    const target = { open: () => {} };

    const result = setAsPortalHandler(target) as PortalHandler;

    const descriptor = Object.getOwnPropertyDescriptor(result, PORTAL_HANDLER);

    expect(descriptor).toBeDefined();
    expect(descriptor?.value).toBe(true);
    expect(descriptor?.enumerable).toBe(false);
    expect(descriptor?.writable).toBe(false);
    expect(descriptor?.configurable).toBe(false);
  });

  it('does not overwrite existing PORTAL_HANDLER if already present', () => {
    const target = {
      [PORTAL_HANDLER]: true,
      open: () => {},
    };

    const result = setAsPortalHandler(target);

    expect(result).toBe(target);
    expect((result as any)[PORTAL_HANDLER]).toBe(true);
  });

  it('works with objects that already have other properties', () => {
    const target = {
      id: 'test-portal',
      title: 'Modal',
      visible: false,
      onClose: () => {},
    };

    const result = setAsPortalHandler(target) as PortalHandler;

    expect(result.id).toBe('test-portal');
    expect((result as any)[PORTAL_HANDLER]).toBe(true);
  });

  it('returns the same object reference (mutation)', () => {
    const original = { open: () => {} };
    const result = setAsPortalHandler(original);

    expect(result).toBe(original); // strict reference equality
  });
});
