import { createMatchScheme } from './createMatchScheme';
import { reactive } from '../reactivity';
import { update } from '../update';
import type { SchemeOptions, MatchScheme, ColorSchemeInfo } from './types';

/**
 * Hook that returns a reactive color scheme info and a setter for the mode.
 *
 * Uses the library's reactivity system so that the returned info object
 * can be observed (e.g. inside `effect` or `computed`).
 *
 * If `matchScheme` is provided, it will be used directly.
 * Otherwise, a new one is created internally using `createMatchScheme(options)`.
 *
 * @param options - Options passed to `createMatchScheme` if no `matchScheme` is provided.
 * @param matchScheme - Optional pre-created MatchScheme instance to use.
 * @returns A tuple: [current reactive ColorSchemeInfo, setMode function]
 *
 * @example
 * const [scheme, setMode] = useColorScheme({ defaultMode: 'dark' });
 *
 * effect(() => {
 *   console.log('Current scheme:', scheme.selected);
 * });
 *
 * setMode('light');
 */
export function useColorScheme(options: SchemeOptions = {}, matchScheme?: MatchScheme): [ColorSchemeInfo, (mode: string) => void] {
  const scheme = matchScheme ?? createMatchScheme(options);

  // Create a reactive copy of the scheme info so it can be tracked
  const info = reactive<ColorSchemeInfo>(scheme.getInfo());

  // Keep the reactive info in sync when mode or system changes
  scheme.onModeChange(() => update(info, scheme.getInfo()));

  scheme.onSysSchemeChange(() => update(info, scheme.getInfo()));

  return [info, scheme.setMode];
}
