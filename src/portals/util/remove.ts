import { Entry } from '../../createEntry';
import { IdCache } from '../../createIdCache';
import { getPortalElement } from './getPortalElement';
import { ELEMENTS_SCOPE } from '../constants';
import type { Portals } from '../types';

export function remove(
  portals: Portals,
  config: {
    portalElement: HTMLElement | (() => HTMLElement);
    entryId: string;
    idCache: IdCache;
  }
): boolean {
  const { entryId, idCache } = config;
  const portalElement = getPortalElement(config.portalElement);
  const portalId = portalElement.id;

  if (!portals[portalId] || (entryId !== '*' && !portals[portalId][entryId])) {
    return false;
  }

  function closeIt({ portalId, entryId, idCache }: Record<string, any>) {
    (portals[portalId][entryId] as Entry<any>).emit('unmount');
    idCache.removeId(ELEMENTS_SCOPE, entryId);
    
    if ((portals[portalId][entryId] as Entry<any>).entryElement) {
      ((portals[portalId][entryId] as Entry<any>).entryElement as HTMLElement).remove();
    }

    delete portals[portalId][entryId];

    return true;
  }

  if (entryId === '*') {
    Object.keys(portals[portalId]).forEach((entryId) => {
      closeIt({ portalId, entryId, idCache });
    });

    return true;
  }

  return closeIt({ portalId, entryId, idCache });
}
