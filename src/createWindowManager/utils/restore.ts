import { activate } from './activate';
import type { WindowManagerSettings } from './types';
import { findWindow, isWindowAllowed, presentWindow } from './state';

/** Restores a minimized or maximized window. @example restore(settings, 'editor'); */
export function restore(settings: WindowManagerSettings, id: string): boolean {
  const window = findWindow(settings, id);
  const canRestoreMinimizedModal = window?.mode === 'modal' && window.status === 'minimized';
  if (!window || (!isWindowAllowed(settings, id) && !canRestoreMinimizedModal)) return false;

  if (window.status === 'minimized') {
    return presentWindow(settings, { ...window, isHidden: false, status: window.restoreBounds ? 'maximized' : 'normal' });
  }
  if (window.status === 'maximized') {
    return presentWindow(settings, { ...window, isHidden: false, status: 'normal', bounds: window.restoreBounds!, restoreBounds: undefined });
  }
  return activate(settings, id);
}
