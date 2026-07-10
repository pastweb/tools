import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { effect, useMatchDevice } from '../../src';
import { setUserAgent, MatchMedia } from '../utils';
import { devicesConfig } from './constants';

let matchMedia: MatchMedia;

vi.useFakeTimers();

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

    it('given a media query changes after creation, when an effect tracks devices, then the reactive state updates', () => {
      const mediaQuery = '(max-width: 320px)';
      const matches = useMatchDevice({
        phone: { mediaQuery },
      });
      const observed: boolean[] = [];

      effect(() => {
        observed.push(matches.devices.phone);
      });

      expect(matches.devices.phone).toBe(false);
      expect(observed).toEqual([false]);

      matchMedia.useMediaQuery(mediaQuery);
      vi.runAllTimers();

      expect(matches.devices.phone).toBe(true);
      expect(observed).toEqual([false, true]);
    });

    it('given a media query changes after creation, when onMatch listens to the device, then the listener is called', () => {
      const mediaQuery = '(max-width: 320px)';
      const matches = useMatchDevice({
        phone: { mediaQuery },
      });
      let changedDevice = '';
      let changedResult = false;

      matches.onMatch('phone', (result, deviceName) => {
        changedResult = result;
        changedDevice = deviceName;
      });

      matchMedia.useMediaQuery(mediaQuery);

      expect(changedDevice).toBe('phone');
      expect(changedResult).toBe(true);
    });
  });
});
