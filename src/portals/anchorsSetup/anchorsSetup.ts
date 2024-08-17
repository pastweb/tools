import { IdCache } from '../../createIdCache';
import { isObject } from '../../isObject';
import { createPortal } from './../createPortal';
import { toolsConstructor } from './toolsConstructor';
import { ELEMENTS_SCOPE } from '../constants';
import { PortalAnchorsIds, Portals, EntryDescriptor, PortalsDescriptor } from '../types';

function setPortals(ids: Record<string, any>, descriptor: Record<string, any>, portals: Record<string, any>, getEntry: () => any, idCache: IdCache, portalsCache: Portals) {
  Object.entries(ids).forEach(([key, val]) => {
    if (isObject(val)) {
      if (descriptor[key] && (!isObject(descriptor[key]) || descriptor[key].$$portal)) {
        throw Error('Portals setup error - The anchors and descriptors Object structure is not the same.');
      }

      descriptor[key] = descriptor[key] || {};
      portals[key] = portals[key] || {};
      setPortals(val, descriptor[key], portals[key], getEntry, idCache, portalsCache);
    } else {
      const portalElement = () => document.getElementById(val as string) as HTMLElement;

      function portalFunction(component: any, props?: Record<string, any> | (() => Record<string, any>), defaults?: Record<string, any>) {
        const portal = createPortal(descriptor[key] || getEntry);

        portal.setPortalElement(portalElement);
        portal.setIdCache(idCache);
        portal.setPortalsCache(portalsCache);

        return toolsConstructor(portal, component, props, defaults);
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
  getEntry: (...args: any[]) => any,
  idCache: IdCache,
  portalsCache: Portals,
): PortalsDescriptor {
  const portals = {};

  setPortals(anchors, descriptor, portals, getEntry, idCache, portalsCache);

  return portals;
}
