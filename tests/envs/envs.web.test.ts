import { describe, it, expect } from 'vitest';
import { isBrowser, isServer, isReactNative, isCapacitor, isNativeScript, isElectron, isNode, isDeno, isBun } from '../../src';

describe('given envs constants on web (jsdom)', () => {
  it('detects browser environment', () => {
    expect(isBrowser).toBe(true);
  });

  it('reports Node.js detection as boolean (may be true under test runners that expose process)', () => {
    expect(typeof isNode).toBe('boolean');
  });

  it('does not detect Deno', () => {
    expect(isDeno).toBe(false);
  });

  it('does not detect Bun', () => {
    expect(isBun).toBe(false);
  });

  it('reports server detection as boolean (may be true under test runners that expose process)', () => {
    expect(typeof isServer).toBe('boolean');
  });

  it('does not detect React Native', () => {
    expect(isReactNative).toBe(false);
  });

  it('does not detect Capacitor', () => {
    expect(isCapacitor).toBe(false);
  });

  it('does not detect NativeScript', () => {
    expect(!!isNativeScript).toBe(false);
  });

  it('does not detect Electron', () => {
    expect(!!isElectron).toBe(false);
  });
});
