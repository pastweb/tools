import { currentPortalsCache as portals } from '../setCurrentPortalsCache';
import { isEntry, type Entry } from '../../createEntry';

export function update(getPortalElement: () => HTMLElement, entryId: string, entryData: any): boolean {
  const portalElement = getPortalElement();
  const portalId = portalElement.id;

  if (!portals[portalId] || (entryId !== '*' && !portals[portalId][entryId])) {
    return false;
  }

  if (entryData) {
    if (entryId === '*') {
      Object.values(portals[portalId]).forEach(entry => {
        if (isEntry(entry)) (entry as Entry<any>).emit('update', entryData);
      });
    } else if (isEntry(portals[portalId][entryId])) {
      (portals[portalId][entryId] as Entry<any>).emit('update', entryData);
    }
  }

  return true;
}
