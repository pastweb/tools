import { isObject } from '../../isObject';
import { isPortal } from '../isPortal';
import { createPortal } from './../createPortal';
import { handlerConstructor } from './handlerConstructor';
import { ELEMENTS_SCOPE } from '../constants';
import type { IdCache } from '../../createIdCache';
import type { PortalAnchorsIds, Portals, EntryDescriptor, PortalsDescriptor } from '../types';

function setPortals(ids: Record<string, any>, descriptor: Record<string, any>, portals: Record<string, any>, idCache: IdCache, portalsCache: Portals, getEntry?: () => any) {
  Object.entries(ids).forEach(([key, val]) => {
    if (isObject(val)) {
      if (descriptor[key] && (!isPortal(descriptor[key]))) {
        throw Error('Portals setup error - The anchors and descriptors Object structure is not the same.');
      }

      descriptor[key] = descriptor[key] || {};
      portals[key] = portals[key] || {};
      setPortals(val, descriptor[key], portals[key], idCache, portalsCache, getEntry);
    } else {
      const portalElement = () => document.getElementById(val as string) as HTMLElement;

      function portalFunction(component: any, props?: Record<string, any> | (() => Record<string, any>), defaults?: Record<string, any>) {
        const hasEntry = !!getEntry;
        const portal = createPortal(descriptor[key] || getEntry);

        portal.setPortalElement(portalElement);
        portal.setIdCache(idCache);
        portal.setPortalsCache(portalsCache);

        return handlerConstructor(portal, hasEntry, component, props, defaults);
      }

      const portal = createPortal(descriptor[key] || getEntry);

      portal.setPortalElement(portalElement);
      portal.setIdCache(idCache);
      portal.setPortalsCache(portalsCache);

      const { open, update, close, remove } = portal;

      portalFunction.open = open;
      portalFunction.update = update;
      portalFunction.close = close;
      portalFunction.remove = remove;
      portalFunction.getEntryId = () => idCache.getId(ELEMENTS_SCOPE);
      portalFunction.removeEntryId = (id: string) => idCache.removeId(ELEMENTS_SCOPE, id);

      portals[key] = portalFunction;
    }
  });
}

export function anchorsSetup(
  anchors: PortalAnchorsIds,
  descriptor: EntryDescriptor,
  idCache: IdCache,
  portalsCache: Portals,
  getEntry?: (...args: any[]) => any,
): PortalsDescriptor {
  const portals = {};

  setPortals(anchors, descriptor, portals, idCache, portalsCache, getEntry);

  return portals;
}
