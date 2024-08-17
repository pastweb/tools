export type ProxyInfo = {
  newValue: any;
  oldValue: any;
  prop: string | number | symbol;
  action: string;
  args: any[],
};

export type ProxyCallback = (info: ProxyInfo) => void | Promise<void>;
