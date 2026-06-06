import { assign } from '../../assign';
import { currentIdCache, type IdCache } from '../../createIdCache';
import { ELEMENTS_SCOPE } from '../../createIdCache';
import type { PortalAnchorsIds } from '../types';

export function generateAnchors(anchors: string[], idCache: IdCache = currentIdCache): PortalAnchorsIds {
  const ids = {};

  anchors = [...new Set(anchors)];
  anchors.forEach(path => {
    const [prefix] = path.split('.').reverse();
    assign(ids, path, `${prefix}${idCache.getId(ELEMENTS_SCOPE)}`);
  });

  return ids;
}
