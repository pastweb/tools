import { getFullElementSize, isObject } from '../../src';

describe('getFullElementSize', () => {
  it('size should be an object', () => {
    const size = getFullElementSize(null);
    expect(isObject(size)).toBe(true);
  });

  it('size.width should be defined', () => {
    const size = getFullElementSize(null);
    expect(size.width).toBeDefined();
  });

  it('size.height should be defined', () => {
    const size = getFullElementSize(null);
    expect(size.height).toBeDefined();
  });

  it('the element full size should be width: 54, height: 54', () => {
    const { width, height } = getFullElementSize(null);
    expect(width).toBe(0);
    expect(height).toBe(0);
  });

  it('getFullElementSize() should return width: 0, height: 0', () => {
    const { width, height } = getFullElementSize(undefined);
    expect(width).toBe(0);
    expect(height).toBe(0);
  });
});
