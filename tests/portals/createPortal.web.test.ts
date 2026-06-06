import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPortal } from '../../src/portals/createPortal';
import * as util from '../../src/portals/util';
import { PORTAL } from '../../src/portals/constants';

vi.mock('../../src/portals/util', () => ({
  assignDefaults: vi.fn((props, defaults) => ({ ...defaults, ...props })),
  open: vi.fn(() => 'entry-id-123'),
  update: vi.fn(() => true),
  close: vi.fn(),
  remove: vi.fn(() => true),
}));

describe('createPortal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a portal object with all required methods', () => {
    const portal = createPortal();

    expect(portal).toHaveProperty('open');
    expect(portal).toHaveProperty('update');
    expect(portal).toHaveProperty('close');
    expect(portal).toHaveProperty('remove');
    expect(portal).toHaveProperty('getPortalElement');
    expect(portal).toHaveProperty('setOnRemove');

    expect(typeof portal.open).toBe('function');
    expect(typeof portal.update).toBe('function');
    expect(typeof portal.close).toBe('function');
    expect(typeof portal.remove).toBe('function');
  });

  it('marks the portal with PORTAL symbol', () => {
    const portal = createPortal();
    expect((portal as any)[PORTAL]).toBe(true);
  });

  it('calls assignDefaults and open when opening a portal', () => {
    const portal = createPortal();
    const component = vi.fn();

    portal.open(component, { title: 'Hello' }, { defaultProp: true });

    expect(util.assignDefaults).toHaveBeenCalledWith(
      { title: 'Hello' },
      { defaultProp: true }
    );

    expect(util.open).toHaveBeenCalled();
  });

  it('uses entry factory when provided', () => {
    const mockEntry = {
      setEntryComponent: vi.fn(),
      mergeOptions: vi.fn(),
      options: { initData: {} },
    };

    const entryFactory = vi.fn(() => mockEntry as any);

    const portal = createPortal(entryFactory);
    const component = () => 'Test';

    portal.open(component, { userId: 123 });

    expect(entryFactory).toHaveBeenCalled();
    expect(mockEntry.setEntryComponent).toHaveBeenCalledWith(component);
    expect(mockEntry.mergeOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        initData: expect.objectContaining({
          userId: 123,
          portal: expect.any(Object),
        }),
      })
    );
  });

  it('passes merged props to entry factory', () => {
    const entryFactory = vi.fn(() => ({
      setEntryComponent: vi.fn(),
      mergeOptions: vi.fn(),
      options: { initData: {} },
    } as any));

    const portal = createPortal(entryFactory, { defaultTheme: 'light' });

    portal.open(() => null, { title: 'Page' }, { extraProp: 'value' });

    expect(entryFactory).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultTheme: 'light',
        title: 'Page',
        extraProp: 'value',
      }),
      expect.anything()
    );
  });

  it('update, close, and remove delegate to util functions', () => {
    const portal = createPortal();

    portal.update('entry-1', { visible: false });
    portal.close('entry-2');
    portal.remove('entry-3');

    expect(util.update).toHaveBeenCalledWith(
      portal.getPortalElement,
      'entry-1',
      { visible: false }
    );
    expect(util.close).toHaveBeenCalledWith(portal.getPortalElement, 'entry-2');
    expect(util.remove).toHaveBeenCalledWith(portal.getPortalElement, 'entry-3');
  });

  it('calls onRemove callback when remove is called', () => {
    const onRemoveMock = vi.fn();
    const portal = createPortal();

    portal.setOnRemove(onRemoveMock);
    portal.remove('entry-xyz');

    expect(onRemoveMock).toHaveBeenCalledWith('entry-xyz');
  });

  it('getPortalElement returns a function (placeholder)', () => {
    const portal = createPortal();
    expect(typeof portal.getPortalElement).toBe('function');
  });

  it('supports functional props in open()', () => {
    const portal = createPortal();
    const dynamicProps = vi.fn(() => ({ count: 42 }));

    portal.open(() => null, dynamicProps);

    expect(util.assignDefaults).toHaveBeenCalledWith(
      { count: 42 },
      expect.any(Object)
    );
  });

  it('handles undefined entry factory gracefully', () => {
    const portal = createPortal(undefined);

    const result = portal.open(() => 'Test', { test: true });

    expect(result).toBe('entry-id-123');
    expect(util.open).toHaveBeenCalled();
  });
});
