import { describe, it, expect } from 'vitest';
import { createMatchDevice, UA_MOBILE_DEFAULT_RE } from '../../src/createMatchDevice';

const matchDevice = createMatchDevice();

describe('given createMatchDevice on server side', () => {
  it('given createMatchDevice() on server, when getDevices called, then it returns empty object (no mobile etc)', () => {
    expect(JSON.stringify(matchDevice.getDevices())).toBe(JSON.stringify({}));
  });

  it('given config with mobile: {} (no ua), when getDevices, then mobile is false', () => {
    const { mobile } = createMatchDevice({ mobile: {} }).getDevices();
    expect(mobile).toBe(false);
  });

  it('given config with mobile uaTest and userAgent matching, when getDevices, then mobile is true', () => {
    const { mobile } = createMatchDevice({
      mobile: {
        uaTest: UA_MOBILE_DEFAULT_RE,
        userAgent: 'iPhone',
      },
    }).getDevices();

    expect(mobile).toBe(true);
  });
});
