import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { effect, useMatchDevice } from '../../src';
import { setUserAgent, MatchMedia } from './util';
import { testUA, devicesConfig } from './constants';
import type { DevicesConfig, MatchDevicesResult, DevicesResult } from '../../src';

let matchMedia: MatchMedia;

describe('given useMatchDevice hook', () => {
  beforeAll(() => {
    matchMedia = new MatchMedia();
  });

  beforeEach(() => {
    setUserAgent();
  });
  
  afterEach(() => {
    matchMedia.clear();
  });

  describe('given useMatchDevice with devicesConfig', () => {
    it.each(Object.entries(devicesConfig))(`given device config "%s" with uaTest, when useMatchDevice(devicesConfig), then matches.devices[device] is true`, (device, config) => {
      const { mediaQuery, uaTest } = config;
      
      if (!mediaQuery && uaTest) {
        setUserAgent(device === 'mobile'? 'iPhone' : device);
        const matches = useMatchDevice(devicesConfig);

        expect(matches.devices[device]).toBe(true);
      }
    });

    it.each(Object.entries(devicesConfig))(`given device config "%s" with mediaQuery, when useMatchDevice after matchMedia setup, then matches.devices[device] is true`, (device, config) => {
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
