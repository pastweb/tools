import { describe, it, expect } from 'vitest';
import { isBrowser, isServer, isReactNative, isCapacitor, isNativeScript, isElectron, isNode, isDeno, isBun } from '../../src';

describe('given envs constants on node', () => {
  it('does not detect browser environment', () => {
    expect(isBrowser).toBe(false);
  });

  it('detects Node.js', () => {
    expect(isNode).toBe(true);
  });

  it('does not detect Deno', () => {
    expect(isDeno).toBe(false);
  });

  it('does not detect Bun', () => {
    expect(isBun).toBe(false);
  });

  it('detects server environment', () => {
    expect(isServer).toBe(true);
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
