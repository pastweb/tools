import { Entry } from '../../createEntry';
import { IdCache } from '../../createIdCache';
import { getPortalElement } from './getPortalElement';
import { ELEMENTS_SCOPE } from '../constants';
import { Portals } from '../types';

export function open(
  portals: Portals,
  config: {
    portalElement: HTMLElement | (() => HTMLElement);
    entry: Entry<any>;
    idCache: IdCache;
  }
): string | false {
  const { entry, idCache } = config;
  const portalElement = getPortalElement(config.portalElement);
  
  if (!portalElement) {
    return false;
  }

  const portalId = portalElement.id;

  if (!portals[portalId]) {
    portals[portalId] = {};
  }

  const entryElement = document.createElement('div');
  const entryId = idCache.getId(ELEMENTS_SCOPE);
  entryElement.id = entryId;
  portalElement.appendChild(entryElement);
  const querySelector = `#${entryId}`;

  entry.mergeOptions({
    entryElement,
    querySelector,
    initData: {
      portalElement,
      entryId,
    },
  });

  portals[portalId][entryId] = entry;

  entry.emit('mount');

  return entryId;
}
