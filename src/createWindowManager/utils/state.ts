import type { ManagedWindowState, WindowBounds, WindowManagerState } from '../types';
import type { WindowManagerSettings } from './types';

/** Reads the current immutable state snapshot. @example getState(settings); */
export function getState(settings: WindowManagerSettings): WindowManagerState {
  return settings.store.snapshot;
}

/** Finds one window by its entry ID. @example findWindow(settings, 'editor'); */
export function findWindow(settings: WindowManagerSettings, id: string): ManagedWindowState | undefined {
  return getState(settings).windows.find(window => window.id === id);
}

/** Finds the topmost visible modal window. @example getModalWindow(settings); */
export function getModalWindow(settings: WindowManagerSettings): ManagedWindowState | undefined {
  return getState(settings).windows.findLast(window =>
    window.mode === 'modal' && window.status !== 'minimized' && !window.isHidden);
}

/** Checks whether a command is allowed by modal blocking. @example isWindowAllowed(settings, 'editor'); */
export function isWindowAllowed(settings: WindowManagerSettings, id: string): boolean {
  const modal = getModalWindow(settings);
  return !modal || modal.id === id;
}

/** Validates and copies renderer geometry. @example normalizeBounds({ x: 0, y: 0, width: 640, height: 480 }); */
export function normalizeBounds(bounds: WindowBounds): WindowBounds {
  if (![bounds.x, bounds.y, bounds.width, bounds.height].every(Number.isFinite)
    || bounds.width <= 0 || bounds.height <= 0) {
    throw new RangeError('Window bounds must be finite with positive dimensions.');
  }

  return Object.freeze({ x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height });
}

/** Copies and freezes one metadata record. @example normalizeMeta({ title: 'Editor' }); */
export function normalizeMeta(meta: Record<string, any>): Record<string, any> {
  return Object.freeze({ ...meta });
}

/** Publishes the next immutable manager snapshot. @example commit(settings, [], null); */
export function commit(settings: WindowManagerSettings, windows: readonly ManagedWindowState[], activeId: string | null): void {
  settings.store.snapshot = Object.freeze({
    windows: Object.freeze(windows.map(window => Object.freeze(window))),
    activeId,
  });
}

/** Replaces one window without changing active-window order. @example replaceWindow(settings, window); */
export function replaceWindow(settings: WindowManagerSettings, window: ManagedWindowState): void {
  commit(
    settings,
    getState(settings).windows.map(item => item.id === window.id ? window : item),
    getState(settings).activeId,
  );
}

/** Invokes the active window's renderer focus callback. @example focusActiveWindow(settings); */
export function focusActiveWindow(settings: WindowManagerSettings): void {
  const activeId = getState(settings).activeId;
  if (activeId) settings.callbacks.get(activeId)?.requestFocus?.();
}

/** Places a window at the front and activates it. @example presentWindow(settings, window); */
export function presentWindow(settings: WindowManagerSettings, window: ManagedWindowState): boolean {
  commit(settings, [...getState(settings).windows.filter(item => item.id !== window.id), window], window.id);
  focusActiveWindow(settings);
  return true;
}
