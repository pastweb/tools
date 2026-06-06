import { createIdCache } from './createIdCache';
import type { IdCache } from './types';

export let currentIdCache = createIdCache();

export function setCurrentIdCache(cache: IdCache): void {
  currentIdCache = cache;
}
