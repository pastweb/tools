import { ELEMENTS_SCOPE, currentIdCache as idCache } from '../../createIdCache';
import { currentPortalsCache as portals } from '../setCurrentPortalsCache';
import { isEntry, type Entry } from '../../createEntry';

export function remove(getPortalElement: () => HTMLElement, entryId: string): boolean {
  const portalElement = getPortalElement();
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

    if (entryElement) {
      setTimeout(() => {
        entryElement.remove();
        idCache.removeId(ELEMENTS_SCOPE, entryId);
        delete portals[portalId][entryId];
      }, 16);
    }

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
