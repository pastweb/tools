import { describe, expect, it } from 'vitest';
import { isHMREnabled, type HotImportMeta } from '../../src';

describe('given the isHMREnabled function', () => {
  it('given Vite import metadata, when isHMREnabled is called, then it returns true', () => {
    expect(isHMREnabled({ hot: {} } as HotImportMeta)).toBe(true);
  });

  it('given Webpack-compatible import metadata, when isHMREnabled is called, then it returns true', () => {
    expect(isHMREnabled({ webpackHot: {} } as HotImportMeta)).toBe(true);
  });

  it('given import metadata without HMR APIs, when isHMREnabled is called, then it returns false', () => {
    expect(isHMREnabled({} as HotImportMeta)).toBe(false);
  });
});
