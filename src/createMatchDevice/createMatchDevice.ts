import { createEventEmitter } from '../createEventEmitter';
import { isSSR } from '../isSSR';
import { noop } from '../noop';
import { MatchDevice, DeviceConfig, DevicesConfig, MatchDevicesResult } from './types';

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

  Object.entries(config).forEach(([deviceName, deviceConfig]: [string, DeviceConfig]) => {
    const forceFalse = isSSR && !deviceConfig.userAgent ? true : false;

    if (forceFalse) {
      devices[deviceName] = false;
      return;
    }

    const { uaTest, mediaQuery } = deviceConfig;
    const userAgent = deviceConfig.userAgent || window && window.navigator.userAgent;
    let  result = !uaTest ? false : typeof uaTest === 'function' ? uaTest(userAgent) : (uaTest as RegExp).test(userAgent);
    
    const mql: MediaQueryList | null = !isSSR && mediaQuery ? window.matchMedia(mediaQuery) : null;

    if (mql && mediaQuery) {
      mqlList.add(mql);
      mql.addEventListener('change', ({ matches }): void => {
        result = uaTest ? result && matches : matches;
        devices[deviceName] = result;
        onDeviceChange();
        emitter.emit(deviceName, devices[deviceName], deviceName);
      });
    }
    
    if (mql && mql.matches) {
      if (uaTest) {
        result = result && mql.matches;
      }
  
      result =  mql.matches;
    }

    devices[deviceName] = result;
  });

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
   * @param {string} deviceName - The name of the device to listen for.
   * @param {function} fn - The callback function to be called when the device match event occurs.
   */
  function onMatch (deviceName: string, fn: (result: boolean, deviceName: string) => void): void {
    emitter.on(deviceName, fn);
  }

  return { getDevices, onChange, onMatch };
}
