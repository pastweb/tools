import { describe, it, expect } from 'vitest';
import { isObject } from '../../src/isObject';
import { deepMerge } from '../../src/deepMerge';

const targetObj = {
  original: 1,
  array: []
};

const source1 = {
  level1: {
    level2: [2, { a: 1, b: 2 }]
  },
  array: [10]
};

const source2 = {
  first: 1,
  second: 'two',
  original: 10,
  level1: {
    level2: [20, { a: 10, c:20 }, 10],
  },
  array: [1, 2]
};

describe('given the deepMerge function', () => {
  const result = deepMerge(targetObj, source1);

  describe('given one source object', () => {
    it('given merged with source1, then result.original is 1', () => {
      expect(result.original).toBe(1);
    });

    it('given merged with source1, then result.level1 is an object', () => {
      expect(isObject(result.level1)).toBe(true);
    });

    it('given merged with source1, then result.level1.level2 is an array', () => {
      expect(Array.isArray(result.level1.level2)).toBe(true);
    });

    it('given merged with source1, then result.array is an array', () => {
      expect(Array.isArray(result.array)).toBe(true);
    });

    it('given merged with source1, then result.array.length is 1', () => {
      expect(result.array.length).toBe(1);
    });

    it('given merged with source1, then result.array[0] is 10', () => {
      expect(result.array[0]).toBe(10);
    });
  });

  describe('given two source objects', () => {
    const result = deepMerge(targetObj, source1, source2);

    it('given merged with source1+source2, then result.original is 10', () => {
      expect(result.original).toBe(10);
    });

    it('given merged with source1+source2, then result.level1 is an object (not empty string)', () => {
      expect(isObject(result.level1)).toBe(true);
    });

    it('given merged with source1+source2, then result.level1.level2 is an array', () => {
      expect(Array.isArray(result.level1.level2)).toBe(true);
    });

    it('given merged with source1+source2, then result.level1.level2.length is 3', () => {
      expect(result.level1.level2.length).toBe(3);
    });

    it('given merged..., then result.level1.level2[0] is 20', () => {
      expect(result.level1.level2[0]).toBe(20);
    });

    it('given merged..., then result.level1.level2[1] is an object', () => {
      expect(isObject(result.level1.level2[1])).toBe(true);
    });

    it('given merged..., then result.level1.level2[1] has 3 keys', () => {
      expect(Object.keys(result.level1.level2[1]).length).toBe(3);
    });

    it('given merged..., then result.level1.level2[1].a is 10', () => {
      expect(result.level1.level2[1].a).toBe(10);
    });

    it('given merged..., then result.level1.level2[1].b is 2', () => {
      expect(result.level1.level2[1].b).toBe(2);
    });

    it('given merged..., then result.level1.level2[1].c is 20', () => {
      expect(result.level1.level2[1].c).toBe(20);
    });

    it('given merged..., then result.level1.level2[2] is 10', () => {
      expect(result.level1.level2[2]).toBe(10);
    });

    it('given merged..., then result.first is 1', () => {
      expect(result.first).toBe(1);
    });

    it('given merged..., then result.second is "two"', () => {
      expect(result.second).toBe('two');
    });

    it('given merged..., then result.array is an array', () => {
      expect(Array.isArray(result.array)).toBe(true);
    });

    it('given merged..., then result.array[0] is 1', () => {
      expect(result.array[0]).toBe(1);
    });

    it('given merged..., then result.array[1] is 2', () => {
      expect(result.array[1]).toBe(2);
    });
  });
});
