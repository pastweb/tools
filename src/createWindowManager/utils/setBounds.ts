import type { WindowBounds } from '../types';
import type { WindowManagerSettings } from './types';
import { findWindow, isWindowAllowed, normalizeBounds, replaceWindow } from './state';

/** Updates geometry for a normal, unblocked window. @example setBounds(settings, 'editor', bounds); */
export function setBounds(settings: WindowManagerSettings, id: string, bounds: WindowBounds): boolean {
  const window = findWindow(settings, id);
  if (!window || window.status !== 'normal' || !isWindowAllowed(settings, id)) return false;
  replaceWindow(settings, { ...window, bounds: normalizeBounds(bounds) });
  return true;
}
