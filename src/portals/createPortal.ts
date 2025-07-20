import { Entry } from '../createEntry';
import { DEFAULT_ID_CACHE } from '../createIdCache';
import { noop } from '../noop';
import { assignDefaults, open, update, close, remove } from './util';
import { DEFAULT_PORTALS_CACHE } from './constants';
import type { Portal } from './types';

export function createPortal(
  entry: ((props: Record<string, any>, component: any) => Entry<any>),
  defaults: Record<string, any> = {},
): Portal {
  const _entry = entry;
  const _defaults = defaults;

  let portalElement: HTMLElement | (() => HTMLElement) = noop;
  let idCache = DEFAULT_ID_CACHE;
  let portals = DEFAULT_PORTALS_CACHE;
  let onRemove = noop;

  const portal: Portal = {
    $$portal: true,
    open: (component: any, props = {}, defaults = {}): string | false => {
      const withDefaults = assignDefaults({
        ...typeof props === 'function' ? props() : props,
      }, { ..._defaults, ...defaults });

      const entry = typeof _entry === 'function' ? _entry(withDefaults, component) : _entry as Entry<any>;
      entry.setEntryComponent(component);
      
      entry.mergeOptions({
        initData: {
          component,
          ...withDefaults,
          ...entry.options.initData,
          portal,
        },
      });
      
      return open(portals, {
        portalElement,
        entry,
        idCache,
      });
    },
    update: (entryId: string, entryData?: any): boolean => {
      return update(portals, {
        portalElement,
        entryId,
        entryData,
      });
    },
    close: (entryId: string): void => close(portalElement, entryId),
    remove: (entryId: string): boolean => {
      onRemove(entryId);
      
      return remove(portals, {
        portalElement,
        entryId,
        idCache,
      });
    },
    setIdCache: newCache => { idCache = newCache; },
    setPortalElement: newElement => { portalElement = newElement; },
    setPortalsCache: newPorals => { portals = newPorals; },
    setOnRemove: fn => { onRemove = fn; },
  };

  Object.defineProperty(portal, '$$portal', {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  });

  return portal;
}
