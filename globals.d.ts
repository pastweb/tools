/**
 * Ambient global declarations for platform / framework specific globals.
 *
 * These variables are injected by the runtime environments:
 * - Capacitor
 * - NativeScript
 * - Deno
 * - Bun
 *
 * Declaring them here prevents TypeScript "Cannot find name" errors in the editor.
 *
 * The triple-slash reference is used in src/envs.ts to ensure the editor picks these up.
 */

declare global {
  // --- Capacitor (https://capacitorjs.com) ---
  var Capacitor: {
    isNativePlatform?(): boolean;
    getPlatform?(): 'web' | 'ios' | 'android' | string;
    [key: string]: any;
  } | undefined;

  // Also available on window in browser contexts
  interface Window {
    Capacitor?: typeof Capacitor;
  }

  // --- NativeScript ---
  var __NS__: boolean | undefined;
  var __nativeScript__: boolean | undefined;

  // --- Deno (https://deno.com) ---
  var Deno: {
    version?: {
      deno: string;
    };
    [key: string]: any;
  } | undefined;

  // --- Bun (https://bun.sh) ---
  var Bun: {
    version?: string;
    [key: string]: any;
  } | undefined;

  // Support for `global` variable used in some environments (Node, bundlers, NativeScript)
  var global: any;

  // In case code references `global` directly (some bundlers/environments)
  interface Global {
    __nativeScript__?: boolean;
    __NS__?: boolean;
  }
}

// This file is a module (required for `declare global` to work properly)
export {};
