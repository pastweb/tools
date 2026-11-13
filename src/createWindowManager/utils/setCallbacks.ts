import type { WindowManagerCallbacks } from '../types';
import type { WindowManagerSettings } from './types';
import { findWindow } from './state';

/** Updates callbacks for a registered renderer. @example setCallbacks(settings, 'editor', { requestFocus }); */
export function setCallbacks(
  settings: WindowManagerSettings,
  id: string,
  callbacks: Partial<WindowManagerCallbacks>,
): boolean {
  if (!findWindow(settings, id)) return false;

  settings.callbacks.set(id, { ...settings.callbacks.get(id), ...callbacks });
  return true;
}
