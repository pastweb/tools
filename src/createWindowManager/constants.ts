import type { WindowBounds } from './types';

export const DEFAULT_WINDOW_BOUNDS: WindowBounds = Object.freeze({ x: 0, y: 0, width: 640, height: 480 });

/**
 * Global-context key used by framework integrations to expose an application
 * window manager.
 */
export const WINDOW_MANAGER_CONTEXT_KEY = '$$WindowManager';
