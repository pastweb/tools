import type { WindowManagerSettings } from './types';
import { commit, findWindow, focusActiveWindow, getState } from './state';

/** Hides one registered window without changing its layout state. */
export function hide(settings: WindowManagerSettings, id: string): boolean {
  const window = findWindow(settings, id);
  if (!window || window.isHidden) return false;

  const windows = getState(settings).windows.map(item => item.id === id ? { ...item, isHidden: true } : item);
  const activeId = getState(settings).activeId === id
    ? windows.findLast(item => item.status !== 'minimized' && !item.isHidden)?.id ?? null
    : getState(settings).activeId;
  const changedActiveWindow = activeId !== getState(settings).activeId;
  commit(settings, windows, activeId);
  if (changedActiveWindow) focusActiveWindow(settings);
  return true;
}

/** Reveals one registered window without changing its stacking order. */
export function show(settings: WindowManagerSettings, id: string): boolean {
  const window = findWindow(settings, id);
  if (!window || !window.isHidden) return false;
  commit(settings, getState(settings).windows.map(item => item.id === id ? { ...item, isHidden: false } : item), getState(settings).activeId);
  return true;
}

/** Hides every registered window in one state update. */
export function hideAll(settings: WindowManagerSettings): boolean {
  const windows = getState(settings).windows;
  if (!windows.some(window => !window.isHidden)) return false;
  commit(settings, windows.map(window => ({ ...window, isHidden: true })), null);
  return true;
}

/** Reveals every registered window in one state update. */
export function showAll(settings: WindowManagerSettings): boolean {
  const windows = getState(settings).windows;
  if (!windows.some(window => window.isHidden)) return false;
  commit(settings, windows.map(window => ({ ...window, isHidden: false })), getState(settings).activeId);
  return true;
}
