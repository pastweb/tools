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

describe('given the createPortal function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('given no arguments, when createPortal is called, then it returns a portal object with all required methods as functions', () => {
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

  it('given a created portal, when inspected, then it is marked with the PORTAL symbol', () => {
    const portal = createPortal();
    expect((portal as any)[PORTAL]).toBe(true);
  });

  it('given a portal, when open is called with component, props and defaults, then it calls assignDefaults and the open util', () => {
    const portal = createPortal();
    const component = vi.fn();

    portal.open(component, { title: 'Hello' }, { defaultProp: true });

    expect(util.assignDefaults).toHaveBeenCalledWith(
      { title: 'Hello' },
      { defaultProp: true }
    );

    expect(util.open).toHaveBeenCalled();
  });

  it('given an entryFactory, when createPortal is called with it and open invoked, then it uses the entry factory to create entries and sets component and merges options', () => {
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

  it('given createPortal with defaults and open with props, when entryFactory provided, then it calls entryFactory with merged defaults, props and extra', () => {
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

  it('given a portal, when update, close and remove are called, then they delegate to the corresponding util functions with correct args', () => {
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

  it('given a portal with onRemove set, when remove is called, then it invokes the onRemove callback with the entry id', () => {
    const onRemoveMock = vi.fn();
    const portal = createPortal();

    portal.setOnRemove(onRemoveMock);
    portal.remove('entry-xyz');

    expect(onRemoveMock).toHaveBeenCalledWith('entry-xyz');
  });

  it('given a created portal, when getPortalElement is accessed, then it returns a function', () => {
    const portal = createPortal();
    expect(typeof portal.getPortalElement).toBe('function');
  });

  it('given functional props in open call, when createPortal and open invoked, then it calls assignDefaults with the resolved props', () => {
    const portal = createPortal();
    const dynamicProps = vi.fn(() => ({ count: 42 }));

    portal.open(() => null, dynamicProps);

    expect(util.assignDefaults).toHaveBeenCalledWith(
      { count: 42 },
      expect.any(Object)
    );
  });

  it('given undefined entry factory, when createPortal called and open invoked, then it still returns an entry id and calls the open util', () => {
    const portal = createPortal(undefined);

    const result = portal.open(() => 'Test', { test: true });

    expect(result).toBe('entry-id-123');
    expect(util.open).toHaveBeenCalled();
  });
});
