import type { WindowManagerSettings } from './types';
import { findWindow, getState, isWindowAllowed } from './state';

/** Dispatches a registered close request. @example close(settings, 'editor'); */
export function close(settings: WindowManagerSettings, id: string): boolean {
  if (!findWindow(settings, id) || !isWindowAllowed(settings, id)) return false;
  const callback = settings.callbacks.get(id)?.requestClose;
  if (!callback) return false;
  callback();
  return true;
}

/** Dispatches close requests for every registered window, from front to back. */
export function closeAll(settings: WindowManagerSettings): boolean {
  let dispatched = false;

  [...getState(settings).windows].reverse().forEach(window => {
    const { id } = window;
    const callback = settings.callbacks.get(id)?.requestClose;
    if (!callback) return;
    callback();
    dispatched = true;
  });

  return dispatched;
}
