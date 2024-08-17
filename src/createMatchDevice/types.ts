export type UATest = RegExp | ((userAgent: string) => boolean);

export type DeviceConfig = {
  userAgent?: string;
  uaTest?: UATest;
  mediaQuery?: string;
};

export type DevicesConfig = {
  [deviceName: string]: DeviceConfig;
};

export type MatchDevicesResult = {
  [isDeviceName: string]: boolean;
};

export interface MatchDevice {
  getDevices: () => MatchDevicesResult;
  onChange: (fn?: (devices: MatchDevicesResult) => void) => void;
  onMatch: (isDeviceName: string, fn: (result: boolean, isDeviceName: string) => void) => void;
}
