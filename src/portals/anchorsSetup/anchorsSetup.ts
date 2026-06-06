import { isObject } from '../../isObject';
import { createPortal } from './../createPortal';
import { handlerConstructor } from './handlerConstructor';
import { ELEMENTS_SCOPE } from '../../createIdCache';
import { currentIdCache, setCurrentIdCache } from '../../createIdCache';
import { currentPortalsCache, setCurrentPortalsCache } from '../setCurrentPortalsCache';
import type { IdCache } from '../../createIdCache';
import type { PortalAnchorsIds, Portals, PortalsDescriptor } from '../types';

function setPortals(getEntry: () => any, ids: Record<string, string>, portals: Record<string, any>) {
  Object.entries(ids).forEach(([key, val]) => {
    if (isObject(val)) {
      throw Error('Portals setup error - The anchors and descriptors Object cannot be a nested object.');
    } else {
      const getPortalElement = () => document.getElementById(val) as HTMLElement;

      function portalFunction(component: any, props?: Record<string, any> | (() => Record<string, any>), defaults?: Record<string, any>) {
        const portal = createPortal(getEntry);
        portal.getPortalElement = getPortalElement;

        return handlerConstructor(getPortalElement, portal, component, props, defaults);
      }

      const portal = createPortal(getEntry);
      portal.getPortalElement = getPortalElement;

      portalFunction.update = portal.update;
      portalFunction.close = portal.close;
      portalFunction.remove = portal.remove;
      portalFunction.getEntryId = () => currentIdCache.getId(ELEMENTS_SCOPE);
      portalFunction.removeEntryId = (id: string) => currentIdCache.removeId(ELEMENTS_SCOPE, id);

      portals[key] = portalFunction;
    }
  });
}

export function anchorsSetup(
  getEntry: (...args: any[]) => any,
  anchorIds: PortalAnchorsIds,
  idCache: IdCache = currentIdCache,
  portalsCache: Portals = currentPortalsCache,
): PortalsDescriptor {
  setCurrentIdCache(idCache);
  setCurrentPortalsCache(portalsCache);

  const portals = {};

  setPortals(getEntry, anchorIds, portals);

  return portals;
}
