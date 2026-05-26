import { UA_MOBILE_DEFAULT_RE, type DevicesConfig } from '../../src';

export const testUA = [
  'iPad',
  'iPhone',
  'iPod',
  'blackberry',
  'Android',
  'windows phone',
  'Windows Phone'
];

export const devicesConfig: DevicesConfig = {
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
