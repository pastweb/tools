import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { effect, useMatchDevice } from '../../src';
import { setUserAgent, MatchMedia } from './util';
import { testUA, devicesConfig } from './constants';
import type { DevicesConfig, MatchDevicesResult, DevicesResult } from '../../src';

let matchMedia: MatchMedia;

describe('useMatchDevice', () => {
  beforeAll(() => {
    matchMedia = new MatchMedia();
  });

  beforeEach(() => {
    setUserAgent();
  });
  
  afterEach(() => {
    matchMedia.clear();
  });

  describe('useMatchDevice - devicesConfig', () => {
    it.each(Object.entries(devicesConfig))(`the property "isDeviceName" in devices result Object sould be true`, (device, config) => {
      const { mediaQuery, uaTest } = config;
      
      if (!mediaQuery && uaTest) {
        setUserAgent(device === 'mobile'? 'iPhone' : device);
        const matches = useMatchDevice(devicesConfig);

        expect(matches.devices[device]).toBe(true);
      }
    });

    it.each(Object.entries(devicesConfig))(`for the device "%s" the mediaQuery should match so "isDeviceName" should be true`, (device, config) => {
      const { mediaQuery, uaTest } = config;

      if (mediaQuery && !uaTest) {
        matchMedia = new MatchMedia(mediaQuery);
        const matches = useMatchDevice(devicesConfig);

        expect(matches.devices[device]).toBe(true);
      }
    });

    // it.each(Object.entries(devicesConfig))(`for the device "%s" the mediaQuery listener should be called.`, (device, config) => {
    //   const { mediaQuery, uaTest } = config;

    //   if (mediaQuery && !uaTest) {
    //     let devicesResult: MatchDevicesResult = {};
        
    //     const onMediaQueryChange = jest.fn().mockImplementation((deviceName: string, fn: (result: boolean, deviceName: string) => void) => {
    //       devicesResult[deviceName] = fn;
    //     });
        
    //     const matches = useMatchDevice(devicesConfig);
    //     matches.onMatch(onMediaQueryChange);
        
    //     matchMedia.useMediaQuery(mediaQuery);

    //     expect(onMediaQueryChange).toHaveBeenCalledTimes(1);
    //   }
    // });
  });
});
