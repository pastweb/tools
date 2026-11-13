import type { WindowManagerSettings } from './types';
import { commit, findWindow, focusActiveWindow, getState } from './state';

/** Removes a registered window after its renderer is removed. @example unregister(settings, 'editor'); */
export function unregister(settings: WindowManagerSettings, id: string): boolean {
  if (!findWindow(settings, id)) return false;

  settings.callbacks.delete(id);
  const windows = getState(settings).windows.filter(window => window.id !== id).map(window =>
    window.ownerId === id ? { ...window, ownerId: undefined } : window);
  const activeId = getState(settings).activeId === id
    ? windows.findLast(window => window.status !== 'minimized' && !window.isHidden)?.id ?? null
    : getState(settings).activeId;
  const changedActiveWindow = activeId !== getState(settings).activeId;
  commit(settings, windows, activeId);
  if (changedActiveWindow) focusActiveWindow(settings);
  return true;
}
