import type { Reactive } from '../../reactivity';
import type { WindowManager, WindowManagerCallbacks, WindowManagerState } from '../types';

export interface WindowManagerSettings {
  store: Reactive<{ snapshot: WindowManagerState }>;
  callbacks: Map<string, WindowManagerCallbacks>;
  children: Set<WindowManager>;
}
