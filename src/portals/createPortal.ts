import { noop } from '../noop';
import { setSymbolKey } from '../setSymbolKey';
import { assignDefaults, open, update, close, remove } from './util';
import { PORTAL } from './constants';
import type { Entry } from '../createEntry';
import type { Portal } from './types';

export function createPortal(
  entry?: ((props: Record<string, any>, component: any) => Entry<any>),
  defaults: Record<string, any> = {},
): Portal {
  const _entry = entry;
  const _defaults = defaults;

  let onRemove = noop;

  const portal: Portal = {
    open: (component: any, props = {}, defaults = {}): string | false => {
      const withDefaults = assignDefaults({
        ...typeof props === 'function' ? props() : props,
      }, { ..._defaults, ...defaults });

      const entry = typeof _entry === 'function' ? _entry(withDefaults, component) : _entry;

      if (entry) {
        entry.setEntryComponent(component);

        entry.mergeOptions({
          initData: {
            ...withDefaults,
            ...entry.options.initData,
            portal,
          },
        });
      }

      return open(portal.getPortalElement, entry);
    },
    update: (entryId: string, entryData?: any): boolean => {
      return update(portal.getPortalElement, entryId, entryData);
    },
    close: (entryId: string): void => close(portal.getPortalElement, entryId),
    remove: (entryId: string): boolean => {
      onRemove(entryId);

      return remove(portal.getPortalElement, entryId);
    },
    getPortalElement: noop,
    setOnRemove: fn => { onRemove = fn; },
  };

  setSymbolKey(portal, PORTAL);

  return portal;
}
