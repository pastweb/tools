import type { Portals } from './types';

export let currentPortalsCache: Portals = {};

export function setCurrentPortalsCache(portals: Portals): void {
  currentPortalsCache = portals;
}
