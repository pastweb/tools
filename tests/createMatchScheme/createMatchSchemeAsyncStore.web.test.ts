import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMatchSchemeAsyncStore } from '../../src/createMatchScheme';
import { MatchMedia } from '../utils';

describe('given the createMatchSchemeAsyncStore factory', () => {
  let matchMedia: MatchMedia;

  beforeEach(() => {
    vi.clearAllMocks();
    matchMedia = new MatchMedia();
  });

  afterEach(() => {
    matchMedia.destroy();
  });

  it('given no args, when createMatchSchemeAsyncStore, then returned store has matchScheme, init, setStoreReady, isReady and matchScheme is defined with init fn', async () => {
    const store = createMatchSchemeAsyncStore();

    expect(store).toHaveProperty('matchScheme');
    expect(store).toHaveProperty('init');
    expect(store).toHaveProperty('setStoreReady');
    expect(store).toHaveProperty('isReady');
    expect(store.matchScheme).toBeDefined();
    expect(typeof store.init).toBe('function');
  });

  it('given default store, when accessing matchScheme.getInfo, then mode auto, system light or dark, selected equals system', async () => {
    const store = createMatchSchemeAsyncStore();

    const info = store.matchScheme.getInfo();
    expect(info.mode).toBe('auto');
    expect(['light', 'dark']).toContain(info.system);
    expect(info.selected).toBe(info.system);
  });

  it('given options with defaultMode dark and datasetName, when create..., then matchScheme info has mode and selected dark', async () => {
    const store = createMatchSchemeAsyncStore({
      defaultMode: 'dark',
      datasetName: 'theme',
    });

    const info = store.matchScheme.getInfo();
    expect(info.mode).toBe('dark');
    expect(info.selected).toBe('dark');
  });

  it('given initStore mock in options, when create and await isReady, then isReady true (initStore would have been used)', async () => {
    const initStoreMock = vi.fn(async () => {});

    const store = createMatchSchemeAsyncStore({
      initStore: initStoreMock,
    });

    const isReady = await store.isReady;;
    expect(isReady).toBe(true);
  });

  // it('creates unique store name when name option is provided', () => {
  //   const store1 = createMatchSchemeAsyncStore({ name: 'Header' });
  //   const store2 = createMatchSchemeAsyncStore({ name: 'Footer' });

  //   expect(store1.name).toContain('ColorSchemeStore:Header');
  //   expect(store2.name).toContain('ColorSchemeStore:Footer');
  // });

  it('given store with light default, when access matchScheme, then info mode light and has setMode/onModeChange/onSysSchemeChange functions', async () => {
    const store = createMatchSchemeAsyncStore({ defaultMode: 'light' });

    const info = store.matchScheme.getInfo();
    expect(info.mode).toBe('light');
    expect(typeof store.matchScheme.setMode).toBe('function');
    expect(typeof store.matchScheme.onModeChange).toBe('function');
    expect(typeof store.matchScheme.onSysSchemeChange).toBe('function');
  });

  it('given a store, when init() called, then it does not throw', () => {
    const store = createMatchSchemeAsyncStore();

    expect(() => store.init()).not.toThrow();
  });
});
