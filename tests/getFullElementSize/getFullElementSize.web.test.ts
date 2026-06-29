import { describe, it, expect } from 'vitest';
import { getFullElementSize, FullElementSize, isObject } from '../../src';

const testElement = document.createElement('div');
testElement.style.width = '40px';
testElement.style.height = '40px';
testElement.style.padding = '3px';
testElement.style.margin = '5px';
testElement.style.border = '2px solid';

describe('given the getFullElementSize function', () => {
  it('given a styled test div, when getFullElementSize, then size is an object', () => {
    const size: FullElementSize = getFullElementSize(testElement);
    expect(isObject(size)).toBe(true);
  });

  it('given styled div, when called, then size.width is defined', () => {
    const size: FullElementSize = getFullElementSize(testElement);
    expect(size.width).toBeDefined();
  });

  it('given styled div, when called, then size.height is defined', () => {
    const size: FullElementSize = getFullElementSize(testElement);
    expect(size.height).toBeDefined();
  });

  it('given the padded 40px testElement, when getFullElementSize, then width and height are 54', () => {
    const { width, height } = getFullElementSize(testElement);
    expect(width).toBe(54);
    expect(height).toBe(54);
  });
});
