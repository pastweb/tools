import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handlerConstructor } from '../../../src/portals/anchorsSetup/handlerConstructor';
import { isPortalHandler } from '../../../src/portals/isPortalHaldler';
import type { Portal } from '../../../src/portals/types';

vi.mock('../setAsPortalHandler', () => ({
  setAsPortalHandler: vi.fn((obj) => obj),
}));

describe('handlerConstructor', () => {
  let mockPortal: Portal;
  let getPortalElement: () => HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();

    getPortalElement = vi.fn(() => document.createElement('div'));

    mockPortal = {
      open: vi.fn(() => 'entry-123'),
      update: vi.fn(() => true),
      close: vi.fn(),
      remove: vi.fn(() => true),
      getPortalElement,
      setOnRemove: vi.fn(),
    } as Portal;
  });

  it('returns a PortalHandler object', () => {
    const handler = handlerConstructor(getPortalElement, mockPortal, () => '<div />');

    expect(handler).toHaveProperty('id');
    expect(handler).toHaveProperty('open');
    expect(handler).toHaveProperty('update');
    expect(handler).toHaveProperty('close');
    expect(handler).toHaveProperty('remove');
    expect(handler).toHaveProperty('onRemove');
    expect(handler).toHaveProperty('getPortalElement');
    expect(handler).toHaveProperty('portal');
  });

  it('marks the handler with PORTAL_HANDLER symbol', () => {
    const handler = handlerConstructor(getPortalElement, mockPortal, () => null);
    expect(isPortalHandler(handler)).toBe(true);
  });

  it('open() calls portal.open and sets the id', () => {
    const component = () => 'Test';
    const handler = handlerConstructor(getPortalElement, mockPortal, component);

    const result = handler.open();

    expect(mockPortal.open).toHaveBeenCalledWith(component, undefined, undefined);
    expect(handler.id).toBe('entry-123');
    expect(result).toBe('entry-123');
  });

  it('update() calls portal.update with current id', () => {
    const handler = handlerConstructor(getPortalElement, mockPortal, () => null);
    handler.id = 'entry-456';

    handler.update({ visible: false, title: 'Updated' });

    expect(mockPortal.update).toHaveBeenCalledWith('entry-456', { visible: false, title: 'Updated' });
  });

  it('update() returns false if no id is set', () => {
    const handler = handlerConstructor(getPortalElement, mockPortal, () => null);
    const result = handler.update({ visible: true });

    expect(result).toBe(false);
    expect(mockPortal.update).not.toHaveBeenCalled();
  });

  it('close() calls portal.close with current id', () => {
    const handler = handlerConstructor(getPortalElement, mockPortal, () => null);
    handler.id = 'entry-789';

    handler.close();

    expect(mockPortal.close).toHaveBeenCalledWith('entry-789');
  });

  it('remove() calls portal.remove and resets id on success', () => {
    const handler = handlerConstructor(getPortalElement, mockPortal, () => null);
    handler.id = 'entry-999';

    const result = handler.remove();

    expect(mockPortal.remove).toHaveBeenCalledWith('entry-999');
    expect(result).toBe(true);
    expect(handler.id).toBe(false);
  });

  it('remove() does not reset id if remove fails', () => {
    mockPortal.remove = vi.fn(() => false);
    const handler = handlerConstructor(getPortalElement, mockPortal, () => null);
    handler.id = 'entry-111';

    const result = handler.remove();

    expect(result).toBe(false);
    expect(handler.id).toBe('entry-111'); // id should remain
  });

  it('onRemove calls portal.setOnRemove', () => {
    const handler = handlerConstructor(getPortalElement, mockPortal, () => null);
    const onRemoveFn = vi.fn();

    handler.onRemove(onRemoveFn);

    expect(mockPortal.setOnRemove).toHaveBeenCalledWith(onRemoveFn);
  });

  it('getPortalElement returns the correct element', () => {
    const handler = handlerConstructor(getPortalElement, mockPortal, () => null);

    const element = handler.getPortalElement();

    expect(getPortalElement).toHaveBeenCalled();
    expect(element).toBeInstanceOf(HTMLElement);
  });

  // it('passes defaults and props correctly to open', () => {
  //   const defaults = { theme: 'dark' };
  //   const props = { title: 'Modal' };
  //   const component = () => null;

  //   const handler = handlerConstructor(getPortalElement, mockPortal, component, defaults);

  //   handler.open();

  //   expect(mockPortal.open).toHaveBeenCalledWith(component, props, defaults);
  // });
});
