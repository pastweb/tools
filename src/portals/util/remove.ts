import { getPortalElement } from './getPortalElement';
import { ELEMENTS_SCOPE } from '../constants';
import { isEntry, type Entry } from '../../createEntry';
import type { IdCache } from '../../createIdCache';
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
    if (isEntry(portals[portalId][entryId])) {
      const entry = portals[portalId][entryId] as Entry<any>;
      entry.emit('unmount');
    }

    const entryElement = document.querySelector(`#${entryId}`);
    if (entryElement) entryElement.remove();
    idCache.removeId(ELEMENTS_SCOPE, entryId);

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
