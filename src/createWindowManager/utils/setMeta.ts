import type { WindowManagerSettings } from './types';
import { findWindow, normalizeMeta, replaceWindow } from './state';

/** Replaces application-owned metadata. @example setMeta(settings, 'editor', { title: 'Editor' }); */
export function setMeta(settings: WindowManagerSettings, id: string, meta: Record<string, any>): boolean {
  const window = findWindow(settings, id);
  if (!window) return false;
  replaceWindow(settings, { ...window, meta: normalizeMeta(meta) });
  return true;
}
