import { createMatchDevice } from './createMatchDevice';
import { reactive } from '../reactivity';
import type { DevicesConfig, DevicesResult } from './types';

/**
 * Creates a reactive device matching manager based on a provided configuration.
 *
 * @param config - Configuration object for matching devices.
 * @returns A reactive object containing the current matched devices and a method to trigger matching manually.
 * @example
 * // Example usage:
 * const { devices, onMatch } = useMatchDevice(myDevicesConfig);
 * console.log(devices); // Access the current matched devices
 * onMatch(); // Manually trigger the match logic
 */
export function useMatchDevice(config: DevicesConfig): DevicesResult {
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
