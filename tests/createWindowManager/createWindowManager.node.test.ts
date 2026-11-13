import { describe, expect, it, vi } from 'vitest';
import { createWindowManager } from '../../src/createWindowManager';
import { effect } from '../../src/reactivity';

const bounds = { x: 10, y: 20, width: 300, height: 200 };
const desktop = { x: 0, y: 0, width: 1200, height: 800 };

describe('createWindowManager', () => {
  it('given independent managers, when registering IDs, then state and callbacks remain isolated', () => {
    const a = createWindowManager();
    const b = createWindowManager();
    const focus = vi.fn();
    expect(a.register({ id: 'a', requestFocus: focus })).toBe(true);
    expect(a.register({ id: 'a' })).toBe(false);
    expect(a.register({ id: '' })).toBe(false);
    expect(a.register({ id: 'child', ownerId: 'missing' })).toBe(false);
    expect(b.state.windows).toEqual([]);
    a.activate('a');
    expect(focus).toHaveBeenCalledTimes(2);
  });

  it('given two windows, when activating and minimizing, then order and focus follow visible windows', () => {
    const manager = createWindowManager();
    const focus = vi.fn();
    manager.register({ id: 'a', requestFocus: focus });
    manager.register({ id: 'b' });
    manager.activate('a');
    expect(manager.state.windows.map(w => w.id)).toEqual(['b', 'a']);
    manager.minimize('a');
    expect(manager.state.activeId).toBe('b');
    expect(manager.activate('a')).toBe(false);
    manager.restore('a');
    expect(manager.state.activeId).toBe('a');
    manager.unregister('a');
    expect(manager.state.activeId).toBe('b');
    manager.minimize('b');
    expect(manager.state.activeId).toBeNull();
    expect(focus).toHaveBeenCalledTimes(3);
  });

  it('given changed bounds, when maximizing repeatedly and minimizing, then restore preserves both layout states', () => {
    const manager = createWindowManager();
    manager.register({ id: 'a' });
    manager.setBounds('a', bounds);
    manager.maximize('a', desktop);
    manager.maximize('a', { ...desktop, width: 1400 });
    expect(manager.setBounds('a', bounds)).toBe(false);
    manager.minimize('a');
    manager.restore('a');
    expect(manager.state.windows[0].status).toBe('maximized');
    expect(manager.state.windows[0].bounds.width).toBe(1400);
    manager.restore('a');
    expect(manager.state.windows[0].bounds).toEqual(bounds);
    expect(manager.state.windows[0].restoreBounds).toBeUndefined();
  });

  it('given nested modals, when other windows request activation or closure, then the top modal blocks them', () => {
    const manager = createWindowManager();
    const close = vi.fn();
    manager.register({ id: 'a', requestClose: close });
    manager.register({ id: 'modal', mode: 'modal', ownerId: 'a' });
    manager.register({ id: 'b' });
    manager.register({ id: 'nested', mode: 'modal', ownerId: 'modal' });
    expect(manager.state.activeId).toBe('nested');
    expect(manager.activate('modal')).toBe(false);
    expect(manager.activate('a')).toBe(false);
    expect(manager.minimize('nested')).toBe(true);
    expect(manager.state.activeId).toBe('modal');
    expect(manager.minimize('a')).toBe(false);
    expect(manager.maximize('a', desktop)).toBe(false);
    expect(manager.restore('a')).toBe(false);
    expect(manager.setBounds('a', bounds)).toBe(false);
    expect(manager.close('a')).toBe(false);
    expect(close).not.toHaveBeenCalled();
    expect(manager.restore('nested')).toBe(true);
    expect(manager.activate('a')).toBe(false);
    expect(manager.minimize('nested')).toBe(true);
    manager.unregister('nested');
    expect(manager.state.activeId).toBe('modal');
    manager.unregister('modal');
    expect(manager.activate('a')).toBe(true);
  });

  it('given a close confirmation callback, when requesting closure, then registration lasts until actual removal', () => {
    const manager = createWindowManager();
    const close = vi.fn();
    manager.register({ id: 'a', requestClose: close });
    expect(manager.close('a')).toBe(true);
    expect(close).toHaveBeenCalledOnce();
    expect(manager.state.windows).toHaveLength(1);
    manager.unregister('a');
    manager.register({ id: 'a', requestClose: () => { manager.unregister('a'); } });
    expect(manager.close('a')).toBe(true);
    expect(manager.state.windows).toEqual([]);
  });

  it('given a registered window, when renderer callbacks are updated, then activation uses the new focus callback', () => {
    const manager = createWindowManager();
    const close = vi.fn();
    const focus = vi.fn();
    manager.register({ id: 'a', requestClose: close });

    expect(manager.setCallbacks('a', { requestFocus: focus })).toBe(true);
    expect(manager.activate('a')).toBe(true);
    expect(manager.close('a')).toBe(true);
    expect(focus).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
    expect(manager.setCallbacks('missing', { requestFocus: focus })).toBe(false);
  });

  it('given managed windows, when hiding and showing them, then visibility and active state stay in the manager', () => {
    const manager = createWindowManager();
    manager.register({ id: 'a' });
    manager.register({ id: 'b' });

    expect(manager.hide('a')).toBe(true);
    expect(manager.state.windows.find(window => window.id === 'a')?.isHidden).toBe(true);
    expect(manager.state.activeId).toBe('b');
    expect(manager.hide('b')).toBe(true);
    expect(manager.state.activeId).toBeNull();
    expect(manager.show('a')).toBe(true);
    expect(manager.state.windows.find(window => window.id === 'a')?.isHidden).toBe(false);
    expect(manager.activate('a')).toBe(true);
    expect(manager.hideAll()).toBe(true);
    expect(manager.state.windows.every(window => window.isHidden)).toBe(true);
    expect(manager.state.activeId).toBeNull();
    expect(manager.showAll()).toBe(true);
    expect(manager.state.windows.every(window => !window.isHidden)).toBe(true);
  });

  it('given registered close callbacks, when closing all windows, then callbacks run from front to back', () => {
    const manager = createWindowManager();
    const closed: string[] = [];
    manager.register({ id: 'a', requestClose: () => closed.push('a') });
    manager.register({ id: 'b', requestClose: () => closed.push('b') });
    manager.activate('a');

    expect(manager.closeAll()).toBe(true);
    expect(closed).toEqual(['a', 'b']);
  });

  it('given child managers, when a parent runs a global command, then it cascades through every descendant', () => {
    const parent = createWindowManager();
    const child = parent.createChild();
    const grandchild = child.createChild();
    const closed: string[] = [];
    parent.register({ id: 'parent', requestClose: () => closed.push('parent') });
    child.register({ id: 'child', requestClose: () => closed.push('child') });
    grandchild.register({ id: 'grandchild', requestClose: () => closed.push('grandchild') });

    expect(parent.hideAll()).toBe(true);
    expect(parent.state.windows[0].isHidden).toBe(true);
    expect(child.state.windows[0].isHidden).toBe(true);
    expect(grandchild.state.windows[0].isHidden).toBe(true);
    expect(parent.showAll()).toBe(true);
    expect(child.state.windows[0].isHidden).toBe(false);
    expect(grandchild.state.windows[0].isHidden).toBe(false);
    expect(parent.closeAll()).toBe(true);
    expect(closed).toEqual(['parent', 'child', 'grandchild']);
  });

  it('given a disposed child manager, when its former parent runs a global command, then it is unaffected', () => {
    const parent = createWindowManager();
    const child = parent.createChild();
    child.register({ id: 'child' });

    child.dispose();
    expect(parent.hideAll()).toBe(false);
    expect(child.state.windows[0].isHidden).toBe(false);
  });

  it('given an owner and child, when removing the owner, then the child remains without a stale owner', () => {
    const manager = createWindowManager();
    manager.register({ id: 'a' });
    manager.register({ id: 'child', ownerId: 'a' });
    manager.unregister('a');
    expect(manager.state.windows[0].ownerId).toBeUndefined();
    expect(manager.state.activeId).toBe('child');
  });

  it('given invalid geometry, when registering or updating, then validation leaves the snapshot unchanged', () => {
    const manager = createWindowManager();
    for (const invalid of [{ ...bounds, x: NaN }, { ...bounds, width: 0 }, { ...bounds, height: -1 }, { ...bounds, y: Infinity }]) {
      expect(() => manager.register({ id: 'bad', bounds: invalid })).toThrow(RangeError);
    }
    manager.register({ id: 'a', bounds });
    const snapshot = manager.state;
    expect(() => manager.setBounds('a', { ...bounds, width: Infinity })).toThrow(RangeError);
    expect(() => manager.maximize('a', { ...desktop, height: 0 })).toThrow(RangeError);
    expect(manager.state).toBe(snapshot);
  });

  it('given immutable snapshots, when replacing metadata, then old state and caller values stay independent', () => {
    const manager = createWindowManager();
    const input = { ...bounds };
    const meta = { title: 'Editor', count: 1 };
    manager.register({ id: 'a', bounds: input, meta });
    const snapshot = manager.state;
    input.x = 999;
    meta.title = 'Changed externally';
    expect(manager.setMeta('a', { title: 'Preview' })).toBe(true);
    expect(snapshot.windows[0].meta).toEqual({ title: 'Editor', count: 1 });
    expect(manager.state.windows[0].meta).toEqual({ title: 'Preview' });
    expect(snapshot.windows[0].bounds.x).toBe(10);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.windows)).toBe(true);
    expect(Object.isFrozen(snapshot.windows[0])).toBe(true);
    expect(Object.isFrozen(snapshot.windows[0].bounds)).toBe(true);
    expect(Object.isFrozen(snapshot.windows[0].meta)).toBe(true);
  });

  it('given inactive, minimized, and blocked windows, when replacing metadata, then metadata updates without changing window state', () => {
    const manager = createWindowManager();
    manager.register({ id: 'a' });
    manager.register({ id: 'b' });
    manager.minimize('a');
    manager.register({ id: 'modal', mode: 'modal' });

    expect(manager.setMeta('a', { state: 'minimized' })).toBe(true);
    expect(manager.setMeta('b', { state: 'blocked' })).toBe(true);
    expect(manager.state.windows.find(window => window.id === 'a')?.status).toBe('minimized');
    expect(manager.state.windows.find(window => window.id === 'b')?.meta).toEqual({ state: 'blocked' });
    expect(manager.state.activeId).toBe('modal');
  });

  it('given taskbar window snapshots, when managing a window, then the manager applies the standard action from current state', () => {
    const manager = createWindowManager();
    manager.register({ id: 'a' });
    manager.register({ id: 'b' });
    const b = manager.state.windows.find(window => window.id === 'b')!;

    expect(manager.manageWindow(b)).toBe(true);
    expect(manager.state.windows.find(window => window.id === 'b')?.status).toBe('minimized');
    expect(manager.state.activeId).toBe('a');
    expect(manager.manageWindow(b)).toBe(true);
    expect(manager.state.windows.find(window => window.id === 'b')?.status).toBe('normal');
    expect(manager.state.activeId).toBe('b');
    expect(manager.manageWindow(b)).toBe(true);
    expect(manager.state.windows.find(window => window.id === 'b')?.status).toBe('minimized');

    manager.register({ id: 'modal', mode: 'modal' });
    const a = manager.state.windows.find(window => window.id === 'a')!;
    expect(manager.manageWindow(a)).toBe(false);
    const modal = manager.state.windows.find(window => window.id === 'modal')!;
    expect(manager.manageWindow(modal)).toBe(true);
    expect(manager.state.windows.find(window => window.id === 'modal')?.status).toBe('minimized');
    expect(manager.manageWindow({ ...a, id: 'missing' })).toBe(false);
  });

  it('given unknown IDs, when dispatching commands, then no state changes occur', () => {
    const manager = createWindowManager();
    const snapshot = manager.state;
    expect(manager.unregister('missing')).toBe(false);
    expect(manager.activate('missing')).toBe(false);
    expect(manager.minimize('missing')).toBe(false);
    expect(manager.maximize('missing', desktop)).toBe(false);
    expect(manager.restore('missing')).toBe(false);
    expect(manager.setBounds('missing', bounds)).toBe(false);
    expect(manager.setMeta('missing', {})).toBe(false);
    expect(manager.close('missing')).toBe(false);
    expect(manager.state).toBe(snapshot);
    manager.register({ id: 'a' });
    expect(manager.close('a')).toBe(false);
  });

  it('given an effect, when registering a window, then reactive readers receive the new state', async () => {
    const manager = createWindowManager();
    const observed: (string | null)[] = [];
    effect(() => { observed.push(manager.state.activeId); });
    manager.register({ id: 'a' });
    await vi.waitFor(() => expect(observed.at(-1)).toBe('a'));
  });
});
