import { ELEMENTS_SCOPE, currentIdCache as idCache } from '../../createIdCache';
import { currentPortalsCache as portals } from '../setCurrentPortalsCache';
import type { Entry } from '../../createEntry';

export function open(getPortalElement: () => HTMLElement, entry?: Entry<any>): string | false {
  const portalElement = getPortalElement();
  
  if (!portalElement) return false;

  const portalId = portalElement.id;

  if (!portals[portalId]) portals[portalId] = {};

  const entryElement = document.createElement('div');
  const entryId = idCache.getId(ELEMENTS_SCOPE);
  entryElement.id = entryId;
  portalElement.appendChild(entryElement);

  if (entry) {
    const querySelector = `#${entryId}`;

    entry.mergeOptions({
      entryElement,
      querySelector,
      initData: {
        portalElement,
        entryId,
      },
    });
  }

  portals[portalId][entryId] = entry || true;

  if (entry) entry.emit('mount');

  return entryId;
}
