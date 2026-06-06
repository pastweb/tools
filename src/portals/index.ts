export { createPortal } from './createPortal';
export { anchorsSetup, generateAnchors } from './anchorsSetup';
export { DEFAULT_PORTAL_ANCHORS, PORTALS_CONTEXT_KEY, PORTAL_ANCHORS_CONTEXT_KEY } from './constants';
export { isPortal } from './isPortal';
export { isPortalHandler } from './isPortalHaldler';
export { currentPortalsCache, setCurrentPortalsCache } from './setCurrentPortalsCache'
export { setAsPortalHandler } from './setAsPortalHandler';

export type {
  Portal,
  Portals,
  PortalAnchors,
  PortalAnchorsIds,
  HandlerConstructor,
  PortalFunction,
  PortalHandler,
  PortalsDescriptor,
} from './types';
