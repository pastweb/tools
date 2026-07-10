import { createMatchDevice } from './createMatchDevice';
import { reactive } from '../reactivity';
import type { DevicesConfig, DevicesResult } from './types';

/**
 * Creates a reactive device matching state from `createMatchDevice`.
 *
 * This is the framework-agnostic companion to React's `useMatchDevice` adapter:
 * it keeps the same `{ devices, onMatch }` return shape, but `devices` is stored
 * in the tools reactivity system. Use `effect()` to react to media-query or user
 * agent match changes.
 *
 * @param config - Configuration object for matching devices.
 * @returns A reactive object containing current device matches and the `onMatch` listener helper.
 *
 * @example
 * ```ts
 * import { effect, useMatchDevice } from '@pastweb/tools';
 *
 * const matchDevice = useMatchDevice({
 *   phone: { mediaQuery: '(max-width: 640px)' },
 * });
 *
 * effect(() => {
 *   console.log(matchDevice.devices.phone);
 * });
 *
 * matchDevice.onMatch('phone', (matches) => {
 *   console.log('phone changed', matches);
 * });
 * ```
 */
export function useMatchDevice(config: DevicesConfig = {}): DevicesResult {
  const match = createMatchDevice(config);
  const state = reactive<DevicesResult>({
    devices: match.getDevices(),
    onMatch: match.onMatch,
  });

  match.onChange(devices => {
    state.devices = devices;
  });

  return state;
}
