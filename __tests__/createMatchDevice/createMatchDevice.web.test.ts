import { createMatchDevice, UA_MOBILE_DEFAULT_RE, DevicesConfig, MatchDevicesResult } from '../../src/createMatchDevice';
import { getDeviceName } from '../../src/createMatchDevice/util';
import { setUserAgent, MatchMedia } from './util';

let matchMedia: MatchMedia;

const testUA = [
  'iPad',
  'iPhone',
  'iPod',
  'blackberry',
  'Android',
  'windows phone',
  'Windows Phone'
];

const devicesConfig: DevicesConfig = {
  mobile: { uaTest: UA_MOBILE_DEFAULT_RE },
  phone: { mediaQuery: '(max-width: 320px)' },
  tablet: { mediaQuery: '(max-width: 600px)' },
  desktop: { mediaQuery: '(max-width: 1024px)' },
  tv: { mediaQuery: '(min-width: 1025px)' },
  iPad: { uaTest: /iPad/, },
  iPhone: { uaTest: /iPhone/ },
  iPod: { uaTest: /iPod/ },
  blackberry: { uaTest: /blackberry/ },
  Android: { uaTest: /Android/ },
  'windows phone': { uaTest: /(W|w)indows (P|p)hone/ },
  'Windows Phone': { uaTest: /(W|w)indows (P|p)hone/ },
};

describe('createMatchDevice - web', () => {
  beforeAll(() => {
    matchMedia = new MatchMedia();
  });

  beforeEach(() => {
    setUserAgent();
  });
 
  afterEach(() => {
    matchMedia.clear();
  });

  describe('defaultUaRegExp', () => {
    it.each(testUA)
      (`the uaRegex test function should return true for "%s"`, (ua: string) => {
        expect(ua).toMatch(UA_MOBILE_DEFAULT_RE);
      });
  });

  describe('devicesConfig', () => {
    it.each(Object.entries(devicesConfig))
      (`the property "isDeviceName" in devices result Object sould be true`, (device, config) => {
        const { mediaQuery, uaTest } = config;
        if (!mediaQuery && uaTest) {
          const isDeviceName = getDeviceName(device);
          setUserAgent(device === 'mobile'? 'iPhone' : device);
          const devices = createMatchDevice(devicesConfig).getDevices();
          expect(/ /g.test(isDeviceName)).toBe(false);
          expect(devices[isDeviceName]).toBe(true);
        }
      });

      it.each(Object.entries(devicesConfig))
        (`for the device "%s" the mediaQuery should match so "isDeviceName" should be true`, (device, config) => {
          const { mediaQuery, uaTest } = config;
          if (mediaQuery && !uaTest) {
            const isDeviceName = getDeviceName(device);
            matchMedia = new MatchMedia(mediaQuery);
            const devices = createMatchDevice(devicesConfig).getDevices();
            expect(devices[isDeviceName]).toBe(true);
          }
        });

      it.each(Object.entries(devicesConfig))
        (`for the device "%s" the mediaQuery listener should be called.`, (device, config) => {
          const { mediaQuery, uaTest } = config;
          if (mediaQuery && !uaTest) {
            let devicesResult: MatchDevicesResult = {};
            
            const onMediaQueryChange = jest.fn().mockImplementation((devices: MatchDevicesResult) => {
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
