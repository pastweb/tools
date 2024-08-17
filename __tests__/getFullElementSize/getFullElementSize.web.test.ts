import { getFullElementSize, FullElementSize, isObject } from '../../src';

const testElement = document.createElement('div');
testElement.style.width = '40px';
testElement.style.height = '40px';
testElement.style.padding = '3px';
testElement.style.margin = '5px';
testElement.style.border = '2px solid';

describe('getFullElementSize', () => {
  it('size should be an object', () => {
    const size: FullElementSize = getFullElementSize(testElement);
    expect(isObject(size)).toBe(true);
  });

  it('size.width should be defined', () => {
    const size: FullElementSize = getFullElementSize(testElement);
    expect(size.width).toBeDefined();
  });

  it('size.height should be defined', () => {
    const size: FullElementSize = getFullElementSize(testElement);
    expect(size.height).toBeDefined();
  });

  it('the element full size should be width: 54, height: 54', () => {
    const { width, height } = getFullElementSize(testElement);
    expect(width).toBe(54);
    expect(height).toBe(54);
  });
});
