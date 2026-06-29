import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handlerConstructor } from '../../../src/portals/anchorsSetup/handlerConstructor';
import { isPortalHandler } from '../../../src/portals/isPortalHaldler';
import type { Portal } from '../../../src/portals/types';

vi.mock('../setAsPortalHandler', () => ({
  setAsPortalHandler: vi.fn((obj) => obj),
}));

describe('given the handlerConstructor function', () => {
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

  it('given getPortalElement, mockPortal and component, when handlerConstructor is called, then it returns a PortalHandler object with all required properties', () => {
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

  it('given a constructed handler, when checked with isPortalHandler, then it is marked with the PORTAL_HANDLER symbol', () => {
    const handler = handlerConstructor(getPortalElement, mockPortal, () => null);
    expect(isPortalHandler(handler)).toBe(true);
  });

  it('given a handler, when open is called, then it calls portal.open with the component and sets the handler id to the returned value', () => {
    const component = () => 'Test';
    const handler = handlerConstructor(getPortalElement, mockPortal, component);

    const result = handler.open();

    expect(mockPortal.open).toHaveBeenCalledWith(component, undefined, undefined);
    expect(handler.id).toBe('entry-123');
    expect(result).toBe('entry-123');
  });

  it('given a handler with an id set, when update is called, then it calls portal.update with the current id and the provided data', () => {
    const handler = handlerConstructor(getPortalElement, mockPortal, () => null);
    handler.id = 'entry-456';

    handler.update({ visible: false, title: 'Updated' });

    expect(mockPortal.update).toHaveBeenCalledWith('entry-456', { visible: false, title: 'Updated' });
  });

  it('given a handler with no id set, when update is called, then it returns false and does not call portal.update', () => {
    const handler = handlerConstructor(getPortalElement, mockPortal, () => null);
    const result = handler.update({ visible: true });

    expect(result).toBe(false);
    expect(mockPortal.update).not.toHaveBeenCalled();
  });

  it('given a handler with an id set, when close is called, then it calls portal.close with the current id', () => {
    const handler = handlerConstructor(getPortalElement, mockPortal, () => null);
    handler.id = 'entry-789';

    handler.close();

    expect(mockPortal.close).toHaveBeenCalledWith('entry-789');
  });

  it('given a handler with an id set, when remove is called and succeeds, then it calls portal.remove and resets the id to false', () => {
    const handler = handlerConstructor(getPortalElement, mockPortal, () => null);
    handler.id = 'entry-999';

    const result = handler.remove();

    expect(mockPortal.remove).toHaveBeenCalledWith('entry-999');
    expect(result).toBe(true);
    expect(handler.id).toBe(false);
  });

  it('given a handler with an id set, when remove is called but fails, then it does not reset the id', () => {
    mockPortal.remove = vi.fn(() => false);
    const handler = handlerConstructor(getPortalElement, mockPortal, () => null);
    handler.id = 'entry-111';

    const result = handler.remove();

    expect(result).toBe(false);
    expect(handler.id).toBe('entry-111'); // id should remain
  });

  it('given a handler, when onRemove is called with a callback, then it delegates to portal.setOnRemove', () => {
    const handler = handlerConstructor(getPortalElement, mockPortal, () => null);
    const onRemoveFn = vi.fn();

    handler.onRemove(onRemoveFn);

    expect(mockPortal.setOnRemove).toHaveBeenCalledWith(onRemoveFn);
  });

  it('given a handler, when getPortalElement is called, then it returns the element from the provided getPortalElement function', () => {
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
