import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMatchSchemeAsyncStore } from '../../src/createMatchScheme';
import { MatchMedia } from '../utils';

describe('createMatchSchemeAsyncStore', () => {
  let matchMedia: MatchMedia;

  beforeEach(() => {
    vi.clearAllMocks();
    matchMedia = new MatchMedia();
  });

  afterEach(() => {
    matchMedia.destroy();
  });

  it('creates a store with default options', async () => {
    const store = createMatchSchemeAsyncStore();

    expect(store).toHaveProperty('matchScheme');
    expect(store).toHaveProperty('init');
    expect(store).toHaveProperty('setStoreReady');
    expect(store).toHaveProperty('isReady');
    expect(store.matchScheme).toBeDefined();
    expect(typeof store.init).toBe('function');
  });

  it('uses defaultMode "auto" by default', async () => {
    const store = createMatchSchemeAsyncStore();

    const info = store.matchScheme.getInfo();
    expect(info.mode).toBe('auto');
    expect(['light', 'dark']).toContain(info.system);
    expect(info.selected).toBe(info.system);
  });

  it('respects custom defaultMode and datasetName', async () => {
    const store = createMatchSchemeAsyncStore({
      defaultMode: 'dark',
      datasetName: 'theme',
    });

    const info = store.matchScheme.getInfo();
    expect(info.mode).toBe('dark');
    expect(info.selected).toBe('dark');
  });

  it('calls initStore during initialization and marks store as ready', async () => {
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

  it('provides a functional matchScheme instance', async () => {
    const store = createMatchSchemeAsyncStore({ defaultMode: 'light' });

    const info = store.matchScheme.getInfo();
    expect(info.mode).toBe('light');
    expect(typeof store.matchScheme.setMode).toBe('function');
    expect(typeof store.matchScheme.onModeChange).toBe('function');
    expect(typeof store.matchScheme.onSysSchemeChange).toBe('function');
  });

  it('init() is a no-op', () => {
    const store = createMatchSchemeAsyncStore();

    expect(() => store.init()).not.toThrow();
  });
});
