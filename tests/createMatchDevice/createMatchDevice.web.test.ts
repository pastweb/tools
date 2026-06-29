import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { createMatchDevice, UA_MOBILE_DEFAULT_RE, type MatchDevicesResult } from '../../src';
import { setUserAgent, MatchMedia } from '../utils';
import { testUA, devicesConfig } from './constants';

let matchMedia: MatchMedia;

describe('given createMatchDevice on web', () => {
  beforeAll(() => {
    matchMedia = new MatchMedia();
  });

  beforeEach(() => {
    setUserAgent();
  });
 
  afterEach(() => {
    matchMedia.clear();
  });

  describe('given defaultUaRegExp tests', () => {
    it.each(testUA)
      (`given ua string "%s", when matched against UA_MOBILE_DEFAULT_RE, then it matches`, (ua: string) => {
        expect(ua).toMatch(UA_MOBILE_DEFAULT_RE);
      });
  });

  // TODO: check why this test fails
  // describe('multiple match', () => {
  //   it.each(testUA)('the "mobile" and "%s" should be true', ua => {
  //     setUserAgent(ua);
  //     const devices = createMatchDevice({ ...devicesConfig, mobile: { uaTest: UA_MOBILE_DEFAULT_RE } }).getDevices();
      
  //     expect(devices.mobile).toBe(true);
  //     expect(devices[ua]).toBe(true);
  //   });
  // });

  describe('given devicesConfig for createMatchDevice', () => {
    it.each(Object.entries(devicesConfig))(`given device config for "%s" using uaTest, when createMatchDevice(devicesConfig) getDevices, then devices[device] is true`, (device, config) => {
      const { mediaQuery, uaTest } = config;
      
      if (!mediaQuery && uaTest) {
        setUserAgent(device === 'mobile'? 'iPhone' : device);
        const devices = createMatchDevice(devicesConfig).getDevices();

        expect(devices[device]).toBe(true);
      }
    });

    it.each(Object.entries(devicesConfig))(`given device config for "%s" using mediaQuery, when createMatchDevice and getDevices after setting media, then devices[device] is true`, (device, config) => {
      const { mediaQuery, uaTest } = config;

      if (mediaQuery && !uaTest) {
        matchMedia = new MatchMedia(mediaQuery);
        const devices = createMatchDevice(devicesConfig).getDevices();

        expect(devices[device]).toBe(true);
      }
    });

    it.each(Object.entries(devicesConfig))(`given device config for "%s" using mediaQuery, when onChange registered and media used, then the onChange listener is called once`, (device, config) => {
      const { mediaQuery, uaTest } = config;

      if (mediaQuery && !uaTest) {
        let devicesResult: MatchDevicesResult = {};
        
        const onMediaQueryChange = vi.fn().mockImplementation((devices: MatchDevicesResult) => {
          devicesResult = devices;
        });
        
        const matchDevice = createMatchDevice(devicesConfig);
        matchDevice.onChange(onMediaQueryChange);
        
        matchMedia.useMediaQuery(mediaQuery);

        expect(onMediaQueryChange).toHaveBeenCalledTimes(1);
      }
    });
  });
});
