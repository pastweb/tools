import type { WindowBounds } from '../types';
import type { WindowManagerSettings } from './types';
import { findWindow, isWindowAllowed, normalizeBounds, presentWindow } from './state';

/** Maximizes a window within supplied workspace bounds. @example maximize(settings, 'editor', bounds); */
export function maximize(settings: WindowManagerSettings, id: string, bounds: WindowBounds): boolean {
  const window = findWindow(settings, id);
  if (!window || !isWindowAllowed(settings, id)) return false;
  return presentWindow(settings, {
    ...window,
    isHidden: false,
    status: 'maximized',
    bounds: normalizeBounds(bounds),
    restoreBounds: window.restoreBounds ?? window.bounds,
  });
}
