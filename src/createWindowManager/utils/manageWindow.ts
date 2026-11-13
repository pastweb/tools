import { activate } from './activate';
import { minimize } from './minimize';
import { restore } from './restore';
import type { ManagedWindowState } from '../types';
import type { WindowManagerSettings } from './types';
import { findWindow, getState } from './state';

/**
 * Applies the standard taskbar action for a window.
 *
 * Minimized windows are restored, the active window is minimized,
 * and every other window is activated. The registered state is looked up by
 * ID, so callers can safely pass a previous immutable state snapshot.
 *
 * @example
 * ```ts
 * manager.manageWindow(window);
 * ```
 */
export function manageWindow(settings: WindowManagerSettings, window: ManagedWindowState): boolean {
  const registeredWindow = findWindow(settings, window.id);
  if (!registeredWindow) return false;
  if (registeredWindow.status === 'minimized') return restore(settings, registeredWindow.id);
  if (registeredWindow.id === getState(settings).activeId) {
    return minimize(settings, registeredWindow.id);
  }
  return activate(settings, registeredWindow.id);
}
