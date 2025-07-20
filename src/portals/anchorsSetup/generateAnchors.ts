import { assign } from '../../assign';
import { IdCache, DEFAULT_ID_CACHE } from '../../createIdCache';
import { ELEMENTS_SCOPE } from '../constants';
import type { PortalAnchorsIds } from '../types';

export function generateAnchors(anchors: string[], idCache: IdCache = DEFAULT_ID_CACHE): PortalAnchorsIds {
  const ids = {};

  anchors = [ ...new Set(anchors) ];
  anchors.forEach(path => {
    const [ prefix ] = path.split('.').reverse();
    assign(ids, path, `${prefix}${idCache.getId(ELEMENTS_SCOPE)}`);
  });

  return ids;
}
