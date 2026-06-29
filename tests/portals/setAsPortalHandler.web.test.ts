import { describe, it, expect } from 'vitest';
import { setAsPortalHandler } from '../../src/portals/setAsPortalHandler';
import { PORTAL_HANDLER } from '../../src/portals/constants';
import type { PortalHandler } from '../../src/portals/types';

describe('given the setAsPortalHandler function', () => {
  it('given a target object, when setAsPortalHandler is called, then it adds the PORTAL_HANDLER symbol and returns the object as PortalHandler', () => {
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

  it('given a target, when setAsPortalHandler is called, then the PORTAL_HANDLER property is non-enumerable, non-writable and non-configurable', () => {
    const target = { open: () => {} };

    const result = setAsPortalHandler(target) as PortalHandler;

    const descriptor = Object.getOwnPropertyDescriptor(result, PORTAL_HANDLER);

    expect(descriptor).toBeDefined();
    expect(descriptor?.value).toBe(true);
    expect(descriptor?.enumerable).toBe(false);
    expect(descriptor?.writable).toBe(false);
    expect(descriptor?.configurable).toBe(false);
  });

  it('given an object that already has PORTAL_HANDLER, when setAsPortalHandler is called, then it does not overwrite and returns the same', () => {
    const target = {
      [PORTAL_HANDLER]: true,
      open: () => {},
    };

    const result = setAsPortalHandler(target);

    expect(result).toBe(target);
    expect((result as any)[PORTAL_HANDLER]).toBe(true);
  });

  it('given an object with other properties like id and title, when setAsPortalHandler is called, then it adds the symbol while preserving other props', () => {
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

  it('given any object, when setAsPortalHandler is called, then it returns the exact same object reference (mutates in place)', () => {
    const original = { open: () => {} };
    const result = setAsPortalHandler(original);

    expect(result).toBe(original); // strict reference equality
  });
});
