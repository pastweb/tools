import type { WindowManagerSettings } from './types';
import { findWindow, isWindowAllowed, presentWindow } from './state';

/** Activates a visible, unblocked window. @example activate(settings, 'editor'); */
export function activate(settings: WindowManagerSettings, id: string): boolean {
  const window = findWindow(settings, id);
  if (!window || window.status === 'minimized' || !isWindowAllowed(settings, id)) return false;
  return presentWindow(settings, { ...window, isHidden: false });
}
