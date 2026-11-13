import type { WindowManagerSettings } from './types';
import { commit, findWindow, focusActiveWindow, getState, isWindowAllowed } from './state';

/** Minimizes a visible, unblocked window. @example minimize(settings, 'editor'); */
export function minimize(settings: WindowManagerSettings, id: string): boolean {
  const window = findWindow(settings, id);
  if (!window || !isWindowAllowed(settings, id) || window.status === 'minimized') return false;

  const windows = getState(settings).windows.map(item => item.id === id
    ? { ...item, status: 'minimized' as const, isHidden: false }
    : item);
  const activeId = getState(settings).activeId === id
    ? windows.findLast(item => item.status !== 'minimized' && !item.isHidden)?.id ?? null
    : getState(settings).activeId;
  const changedActiveWindow = activeId !== getState(settings).activeId;
  commit(settings, windows, activeId);
  if (changedActiveWindow) focusActiveWindow(settings);
  return true;
}
