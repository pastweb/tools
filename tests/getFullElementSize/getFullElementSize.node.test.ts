import { describe, it, expect } from 'vitest';
import { getFullElementSize, isObject } from '../../src';

describe('given the getFullElementSize function', () => {
  it('given null element, when getFullElementSize called, then result is an object (via isObject)', () => {
    const size = getFullElementSize(null);
    expect(isObject(size)).toBe(true);
  });

  it('given null, when called, then size.width is defined', () => {
    const size = getFullElementSize(null);
    expect(size.width).toBeDefined();
  });

  it('given null, when called, then size.height is defined', () => {
    const size = getFullElementSize(null);
    expect(size.height).toBeDefined();
  });

  it('given null, when getFullElementSize, then width and height are both 0 (not 54)', () => {
    const { width, height } = getFullElementSize(null);
    expect(width).toBe(0);
    expect(height).toBe(0);
  });

  it('given undefined, when getFullElementSize, then width and height are 0', () => {
    const { width, height } = getFullElementSize(undefined);
    expect(width).toBe(0);
    expect(height).toBe(0);
  });
});
