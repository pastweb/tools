export const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

export const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

export const isDeno = typeof Deno !== 'undefined' && Deno.version != null;

export const isBun = typeof Bun !== 'undefined' && Bun.version != null;

export const isServer = isNode || isDeno || isBun;

export const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

export const isCapacitor = typeof Capacitor !== 'undefined';

export const isNativeScript = typeof __NS__ !== 'undefined' || (typeof global !== 'undefined' && global.__nativeScript__);

export const isElectron = typeof process !== 'undefined' && !!process.versions?.electron;
