import { describe, test, expect, beforeAll, afterEach, vi } from 'vitest';
import { MatchMedia } from './MatchMedia';

let matchMedia: MatchMedia;

const appearanceMq = {
  light: '(prefers-color-scheme: light)',
  dark: '(prefers-color-scheme: dark)',
};

describe('given the MatchMedia mock utility', () => {
  beforeAll(() => {
    matchMedia = new MatchMedia();
  });

  afterEach(() => {
    matchMedia.clear();
  });

  describe('given adding listeners', () => {
    test('given mql for light, when addEventListener change twice, then getListeners(light) length 2', () => {
      const firstListener = vi.fn();
      const secondListener = vi.fn();
      const mql = window.matchMedia(appearanceMq.light);

      mql.addEventListener('change', firstListener);
      mql.addEventListener<'change'>('change', secondListener);

      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(2);
    });

    test('given mql, when addEventListener with non-change event, then getListeners length 0', () => {
      const listener = vi.fn();
      const mql = window.matchMedia(appearanceMq.light);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mql.addEventListener<'click'>('click', listener);

      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(0);
    });

    test('given mql, when add same listener twice for change, then listeners length 1', () => {
      const listener = vi.fn();
      const mql = window.matchMedia(appearanceMq.light);

      mql.addEventListener('change', listener);
      mql.addEventListener<'change'>('change', listener);

      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(1);
    });
  });

  describe('given removing listeners', () => {
    test('given two listeners added, when remove both, then getListeners length 0', () => {
      const firstListener = vi.fn();
      const secondListener = vi.fn();
      const mql = window.matchMedia(appearanceMq.light);

      mql.addEventListener('change', firstListener);
      mql.addEventListener('change', secondListener);

      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(2);

      mql.removeEventListener('change', firstListener);
      mql.removeEventListener('change', secondListener);

      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(0);
    });

    test('given add non-change, when remove non-change, then listeners length still 1', () => {
      const listener = vi.fn();
      const mql = window.matchMedia(appearanceMq.light);

      mql.addEventListener<'change'>('change', listener);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mql.removeEventListener<'click'>('click', listener);

      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(1);
    });

    test('given listener not added, when remove on unknown/dark, then getMediaQueries does not contain it (noop)', () => {
      const listener = vi.fn();

      expect(matchMedia.getMediaQueries()).not.toContain(listener);
      window.matchMedia(appearanceMq.dark).removeEventListener('change', listener);
      expect(matchMedia.getMediaQueries()).not.toContain(listener);
    });

    test('given two added, when remove first twice, then length 1 and still contains the second', () => {
      const firstListener = vi.fn();
      const secondListener = vi.fn();
      const mql = window.matchMedia(appearanceMq.light);

      mql.addEventListener('change', firstListener);
      mql.addEventListener<'change'>('change', secondListener);

      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(2);

      mql.removeEventListener('change', firstListener);
      mql.removeEventListener<'change'>('change', firstListener);

      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(1);
      expect(matchMedia.getListeners(appearanceMq.light)).toContain(secondListener);
    });
  });

  describe('given calling listeners', () => {
    test('given useMediaQuery(true) non string, then it throws', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        matchMedia.useMediaQuery(true);
      }).toThrow();
    });

    test('given useMediaQuery(light), then window.matchMedia(light).matches is truthy (instant check)', () => {
      matchMedia.useMediaQuery(appearanceMq.light);

      expect(window.matchMedia(appearanceMq.light).matches).toBeTruthy();
    });

    test('given listeners registered for light that check matches, when useMediaQuery(light), then each listener called once', () => {
      const firstListener = vi.fn();
      const secondListener = vi.fn();

      const mql = window.matchMedia(appearanceMq.light);

      mql.addEventListener('change', (ev) => ev.matches && firstListener());
      mql.addEventListener('change', (ev) => ev.matches && secondListener());

      matchMedia.useMediaQuery(appearanceMq.light);

      expect(firstListener).toHaveBeenCalledTimes(1);
      expect(secondListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('given clearing and destroying', () => {
    test('given registered, when clear, then mediaQueries and listeners lengths 0', () => {
      const firstListener = vi.fn();
      const secondListener = vi.fn();
      const mql = window.matchMedia(appearanceMq.light);

      mql.addEventListener('change', firstListener);
      mql.addEventListener<'change'>('change', secondListener);

      expect(matchMedia.getMediaQueries()).toHaveLength(1);
      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(2);

      matchMedia.clear();

      expect(matchMedia.getMediaQueries()).toHaveLength(0);
      expect(matchMedia.getListeners(appearanceMq.light)).toHaveLength(0);
    });

    test('when destroy, then window.matchMedia is undefined (and restores mock after)', () => {
      matchMedia.destroy();

      expect(window.matchMedia).toBeUndefined();

      // Restoring the mock in case of reordering tests
      matchMedia = new MatchMedia();
    });
  });
});
