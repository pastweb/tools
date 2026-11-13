/** Geometry in the coordinate system chosen by the renderer. */
export interface WindowBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type WindowMode = 'floating' | 'modal';
export type WindowStatus = 'normal' | 'minimized' | 'maximized';

export interface ManagedWindowState {
  readonly id: string;
  /** Application-owned data associated with this window. */
  readonly meta: Record<string, any>;
  readonly mode: WindowMode;
  readonly status: WindowStatus;
  /** Whether the renderer should be hidden without changing its layout state. */
  readonly isHidden: boolean;
  readonly bounds: WindowBounds;
  readonly restoreBounds?: WindowBounds;
  /** Informational ownership; modal blocking is manager-wide. */
  readonly ownerId?: string;
}

export interface WindowRegistration {
  id: string;
  /** Application-owned data associated with this window. */
  meta?: Record<string, any>;
  mode?: WindowMode;
  bounds?: WindowBounds;
  /** Must identify an already registered window. */
  ownerId?: string;
  /** Request closure; unregister only after actual removal. */
  requestClose?: () => void;
  /** The renderer decides which element receives focus. */
  requestFocus?: () => void;
}

/** Renderer callbacks associated with a registered window. */
export type WindowManagerCallbacks = Pick<WindowRegistration, 'requestClose' | 'requestFocus'>;

export interface WindowManagerState {
  /** Back-to-front order, including minimized entries. Immutable snapshots. */
  readonly windows: readonly ManagedWindowState[];
  readonly activeId: string | null;
}

export interface WindowManager {
  /** Read inside an effect to subscribe to changes. */
  readonly state: WindowManagerState;
  /** Creates an independent manager whose global commands also receive this manager's cascaded commands. */
  createChild(): WindowManager;
  /** Detaches this manager from its parent and detaches all of its children. */
  dispose(): void;
  /** Returns false for an empty/duplicate ID or an unknown owner. */
  register(window: WindowRegistration): boolean;
  /** Updates renderer callbacks without changing the managed window state. */
  setCallbacks(id: string, callbacks: Partial<WindowManagerCallbacks>): boolean;
  /** Removes metadata only; surviving children lose their owner reference. */
  unregister(id: string): boolean;
  activate(id: string): boolean;
  /** Hides a registered window without changing its layout state. */
  hide(id: string): boolean;
  /** Reveals a registered window without activating it. */
  show(id: string): boolean;
  /** Hides every registered window in this manager and its child managers. */
  hideAll(): boolean;
  /** Reveals every registered window in this manager and its child managers without changing their order. */
  showAll(): boolean;
  minimize(id: string): boolean;
  /** Explicit workspace bounds avoid any dependency on browser globals. */
  maximize(id: string, bounds: WindowBounds): boolean;
  /** Restores a minimized window to its previous normal/maximized state. */
  restore(id: string): boolean;
  /** Only normal windows can be moved/resized directly. */
  setBounds(id: string, bounds: WindowBounds): boolean;
  /** Replaces the application-owned metadata for a registered window. */
  setMeta(id: string, meta: Record<string, any>): boolean;
  /** Applies the standard taskbar action for a registered window. */
  manageWindow(window: ManagedWindowState): boolean;
  /** Returns whether a close callback was dispatched, not whether closure completed. */
  close(id: string): boolean;
  /** Requests closure for every registered window, from front to back, in this manager and its child managers. */
  closeAll(): boolean;
}
