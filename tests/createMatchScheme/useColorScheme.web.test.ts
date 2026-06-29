import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useColorScheme, createMatchScheme, effect } from '../../src';
import { MatchMedia } from '../utils';

vi.useFakeTimers();

describe('given useColorScheme hook', () => {
  let matchMedia: MatchMedia;

  beforeEach(() => {
    vi.clearAllMocks();
    matchMedia = new MatchMedia();
  });

  afterEach(() => {
    matchMedia.destroy();
  });

  it('given no options, when useColorScheme called, then returns [ColorSchemeInfo, setMode] tuple with initial info', () => {
    const [info, setMode] = useColorScheme();

    expect(info).toEqual({
      mode: expect.any(String),
      system: expect.any(String),
      selected: expect.any(String),
    });
    expect(typeof setMode).toBe('function');
  });

  it('given defaultMode dark, when useColorScheme, then info.mode and info.selected are dark', () => {
    const [info] = useColorScheme({ defaultMode: 'dark' });

    expect(info.mode).toBe('dark');
    expect(info.selected).toBe('dark');
  });

  it('given passed matchScheme, when useColorScheme(options, scheme), then uses the provided scheme', () => {
    const scheme = createMatchScheme({ defaultMode: 'light' });
    const [info] = useColorScheme({}, scheme);

    expect(info.mode).toBe('light');
    expect(info.selected).toBe('light');
  });

  it('given scheme, when setMode called, then the reactive info updates immediately', () => {
    const [info, setMode] = useColorScheme();

    setMode('dark');

    expect(info.selected).toBe('dark');
    expect(info.mode).toBe('dark');
  });

  it('given scheme from hook, when setMode, then effect observes the updated selected value (after timers for debounce)', () => {
    const [info, setMode] = useColorScheme({ defaultMode: 'light' });
    const observed: string[] = [];

    effect(() => {
      observed.push(info.selected);
    });

    setMode('dark');
    vi.runAllTimers();

    expect(observed).toContain('dark');
    expect(info.selected).toBe('dark');
  });

  it('given passed matchScheme, when setMode on the hook, then the original scheme and info both reflect the change', () => {
    const scheme = createMatchScheme({ defaultMode: 'auto' });
    const [info, setMode] = useColorScheme({}, scheme);

    setMode('dark');

    expect(scheme.getInfo().selected).toBe('dark');
    expect(info.selected).toBe('dark');
  });
});
