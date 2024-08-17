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

describe('mergeObjects', () => {
  const result = deepMerge(targetObj, source1);

  describe('with one source', () => {
    it('result.original sould be 1', () => {
      expect(result.original).toBe(1);
    });

    it('result.level1 sould be an object', () => {
      expect(isObject(result.level1)).toBe(true);
    });

    it('result.level1.level2 sould be an array', () => {
      expect(Array.isArray(result.level1.level2)).toBe(true);
    });

    it('result.array sould be an array', () => {
      expect(Array.isArray(result.array)).toBe(true);
    });

    it('result.array.length should be 1', () => {
      expect(result.array.length).toBe(1);
    });

    it('result.array[0] sould be 10', () => {
      expect(result.array[0]).toBe(10);
    });
  });

  describe('with two source', () => {
    const result = deepMerge(targetObj, source1, source2);

    it('result.original sould be 10', () => {
      expect(result.original).toBe(10);
    });

    it('result.level1 should be an empty string', () => {
      expect(isObject(result.level1)).toBe(true);
    });

    it('result.level1.level2 should be an array', () => {
      expect(Array.isArray(result.level1.level2)).toBe(true);
    });

    it('result.level1.level2.length should 3', () => {
      expect(result.level1.level2.length).toBe(3);
    });

    it('result.level1.level2[0] should 20', () => {
      expect(result.level1.level2[0]).toBe(20);
    });

    it('result.level1.level2[1] should be an Object.', () => {
      expect(isObject(result.level1.level2[1])).toBe(true);
    });

    it('result.level1.level2[1] should have 3 keys.', () => {
      expect(Object.keys(result.level1.level2[1]).length).toBe(3);
    });

    it('result.level1.level2[1].a should be 10.', () => {
      expect(result.level1.level2[1].a).toBe(10);
    });

    it('result.level1.level2[1].b should be 2.', () => {
      expect(result.level1.level2[1].b).toBe(2);
    });

    it('result.level1.level2[1].c should be 20.', () => {
      expect(result.level1.level2[1].c).toBe(20);
    });

    it('result.level1.level2[2] should be 10.', () => {
      expect(result.level1.level2[2]).toBe(10);
    });

    it('result.first should be 1', () => {
      expect(result.first).toBe(1);
    });

    it('result.second should be "two"', () => {
      expect(result.second).toBe('two');
    });

    it('result.array should be an array', () => {
      expect(Array.isArray(result.array)).toBe(true);
    });

    it('result.array[0] should be 1', () => {
      expect(result.array[0]).toBe(1);
    });

    it('result.array[1] should be 2', () => {
      expect(result.array[1]).toBe(2);
    });
  });
});
