import { DEFAULT_WINDOW_BOUNDS } from '../constants';
import type { WindowRegistration } from '../types';
import type { WindowManagerSettings } from './types';
import { commit, findWindow, focusActiveWindow, getModalWindow, getState, normalizeBounds, normalizeMeta } from './state';

/** Registers a window and its renderer callbacks. @example register(settings, { id: 'editor' }); */
export function register(settings: WindowManagerSettings, input: WindowRegistration): boolean {
  if (!input.id || findWindow(settings, input.id) || (input.ownerId !== undefined && !findWindow(settings, input.ownerId))) {
    return false;
  }

  const window = {
    id: input.id,
    meta: normalizeMeta(input.meta ?? {}),
    mode: input.mode ?? 'floating',
    status: 'normal' as const,
    isHidden: false,
    bounds: normalizeBounds(input.bounds ?? DEFAULT_WINDOW_BOUNDS),
    ownerId: input.ownerId,
  };
  settings.callbacks.set(input.id, { requestClose: input.requestClose, requestFocus: input.requestFocus });

  const blocker = getModalWindow(settings);
  const windows = [...getState(settings).windows];
  if (blocker && window.mode !== 'modal') windows.splice(windows.indexOf(blocker), 0, window);
  else windows.push(window);

  const shouldActivate = !blocker || window.mode === 'modal';
  commit(settings, windows, shouldActivate ? window.id : getState(settings).activeId);
  if (shouldActivate) focusActiveWindow(settings);
  return true;
}
