import { reactive } from '../reactivity';
import {
  activate,
  close,
  closeAll,
  hide,
  hideAll,
  manageWindow,
  maximize,
  minimize,
  register,
  restore,
  setBounds,
  setCallbacks,
  setMeta,
  show,
  showAll,
  unregister,
} from './utils';
import { getState } from './utils/state';
import type { WindowManager } from './types';
import type { WindowManagerSettings } from './utils/types';

/**
 * Creates an independent, DOM-free reactive window manager.
 * Modal windows block activation and layout commands for other windows.
 * Renderers own mounting, visibility, focus, and close confirmation.
 *
 * @returns A manager with immutable reactive state snapshots.
 * @example
 * ```ts
 * const desktop = createWindowManager();
 * desktop.register({ id: 'editor', meta: { title: 'Editor' }, requestClose: () => editor.close() });
 * desktop.maximize('editor', { x: 0, y: 0, width: 1200, height: 800 });
 * desktop.restore('editor');
 * ```
 */
export function createWindowManager(): WindowManager {
  return createManager();
}

function createManager(parent?: WindowManagerSettings): WindowManager {
  const settings: WindowManagerSettings = {
    store: reactive({
      snapshot: Object.freeze({ windows: Object.freeze([]), activeId: null }),
    }),
    callbacks: new Map(),
    children: new Set(),
  };

  const manager: WindowManager = {
    get state() { return getState(settings); },
    createChild: () => createManager(settings),
    dispose: () => {
      [...settings.children].forEach(child => child.dispose());
      parent?.children.delete(manager);
    },
    register: input => register(settings, input),
    setCallbacks: (id, callbacks) => setCallbacks(settings, id, callbacks),
    unregister: id => unregister(settings, id),
    activate: id => activate(settings, id),
    hide: id => hide(settings, id),
    show: id => show(settings, id),
    hideAll: () => runGlobalCommand(settings, 'hideAll', () => hideAll(settings)),
    showAll: () => runGlobalCommand(settings, 'showAll', () => showAll(settings)),
    minimize: id => minimize(settings, id),
    maximize: (id, bounds) => maximize(settings, id, bounds),
    restore: id => restore(settings, id),
    setBounds: (id, bounds) => setBounds(settings, id, bounds),
    setMeta: (id, meta) => setMeta(settings, id, meta),
    manageWindow: window => manageWindow(settings, window),
    close: id => close(settings, id),
    closeAll: () => runGlobalCommand(settings, 'closeAll', () => closeAll(settings)),
  };

  parent?.children.add(manager);
  return manager;
}

function runGlobalCommand(
  settings: WindowManagerSettings,
  command: 'closeAll' | 'hideAll' | 'showAll',
  applyLocal: () => boolean,
): boolean {
  let changed = applyLocal();
  [...settings.children].forEach(child => { changed = child[command]() || changed; });
  return changed;
}
