import { isEntry, type Entry } from '../../createEntry';
import { getPortalElement } from './getPortalElement';
import type { Portals } from '../types';

export function update(
  portals: Portals,
  config: {
    portalElement: HTMLElement | (() => HTMLElement);
    entryId: string;
    entryData: any;
  }
): boolean {
  const { entryId, entryData } = config;
  const portalElement = getPortalElement(config.portalElement);
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
