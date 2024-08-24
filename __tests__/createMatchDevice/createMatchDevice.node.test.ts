import { createMatchDevice, UA_MOBILE_DEFAULT_RE } from '../../src/createMatchDevice';

const matchDevice = createMatchDevice();

describe('createMatchDevice - server side.', () => {
  it('isMobile should be false on the server side', () => {
    expect(JSON.stringify(matchDevice.getDevices())).toBe(JSON.stringify({}));
  });

  it('when the useAgent is not defined it should return false.', () => {
    const { mobile } = createMatchDevice({ mobile: {} }).getDevices();
    expect(mobile).toBe(false);
  });

  it('when the useAgent and uaRegExp are defined it should return true.', () => {
    const { mobile } = createMatchDevice({
      mobile: {
        uaTest: UA_MOBILE_DEFAULT_RE,
        userAgent: 'iPhone',
      },
    }).getDevices();

    expect(mobile).toBe(true);
  });
});
