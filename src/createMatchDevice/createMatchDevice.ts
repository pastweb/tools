import { createEventEmitter } from '../createEventEmitter';
import { isSSR } from '../isSSR';
import { noop } from '../noop';
import { getDeviceName } from './util';
import { MatchDevice, DeviceConfig, DevicesConfig, MatchDevicesResult, UATest } from './types';

/**
 * Creates a match device utility that detects device types based on user agent and media queries.
 *
 * @param {DevicesConfig} config - Configuration object mapping device names to their detection criteria.
 * @returns {MatchDevice} An object with methods to get current devices, set change listeners, and listen for specific device matches.
 */
export function createMatchDevice(config: DevicesConfig = {}): MatchDevice {
  const emitter = createEventEmitter();
  const devices: MatchDevicesResult = {};
  const mqlList: Set<MediaQueryList> = new Set<MediaQueryList>();
  let onChangeCallback: (devices: MatchDevicesResult) => void = noop;

  Object.entries(config).forEach(
    ([deviceName, deviceConfig]: [string, DeviceConfig]) => {
      const isDeviceName = getDeviceName(deviceName);

      const forceFalse = isSSR && !deviceConfig.userAgent ? true : false;

      if (forceFalse) {
        devices[isDeviceName] = false;
      } else {
        const { uaTest, mediaQuery } = deviceConfig;
        const userAgent = deviceConfig.userAgent || window && window.navigator.userAgent;

        const mql: MediaQueryList | null = !isSSR && mediaQuery ? window.matchMedia(mediaQuery) : null;

        if (mql && mediaQuery) {
          mqlList.add(mql);
          mql.addEventListener('change', ({ matches }): void => {
            devices[isDeviceName] = checkMatch(userAgent, uaTest, matches);
            onDeviceChange();
            emitter.emit(deviceName, devices[isDeviceName], isDeviceName);
          });
        }
        
        devices[isDeviceName] = checkMatch(userAgent, uaTest, !!mql?.matches);
      }
    }
  );

  /**
   * Checks if the user agent and media query match the criteria for a specific device.
   *
   * @param {string} userAgent - The user agent string.
   * @param {UATest | undefined} uaTest - A function or regex to test the user agent.
   * @param {boolean} matches - Whether the media query matches.
   * @returns {boolean} - True if the device matches the criteria, false otherwise.
   */
  function checkMatch (
    userAgent: string,
    uaTest: UATest | undefined,
    matches: boolean,
  ): boolean {
    const uaResult = !uaTest ? false :
      typeof uaTest === 'function' ?
        uaTest(userAgent) :
        (uaTest as RegExp).test(userAgent);
  
    if (matches) {
      if (uaTest) {
        return uaResult && matches;
      }
  
      return matches;
    }
  
    if (uaTest) return uaResult;
    
    return false;
  }

  /**
   * Callback function for device change events.
   */
  function onDeviceChange(): void {
    onChangeCallback({ ...devices });
  }

  /**
   * Gets the current matched devices.
   *
   * @returns {MatchDevicesResult} - An object representing the current state of device matches.
   */
  function getDevices(): MatchDevicesResult {
    return { ...devices };
  }

  /**
   * Sets a callback function to be called when the device match state changes.
   *
   * @param {function} fn - The callback function to be called on change.
   */
  function onChange(fn: (devices: MatchDevicesResult) => void = noop): void {
    onChangeCallback = fn;
  }

  /**
   * Sets a listener for a specific device match event.
   *
   * @param {string} isDeviceName - The name of the device to listen for.
   * @param {function} fn - The callback function to be called when the device match event occurs.
   */
  function onMatch (isDeviceName: string, fn: (result: boolean, isDeviceName: string) => void): void {
    emitter.on(isDeviceName, fn);
  }

  return { getDevices, onChange, onMatch };
}
