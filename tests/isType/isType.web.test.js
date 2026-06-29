import { describe, it, expect } from 'vitest';
import { isType } from '../../src';

const types = {
  Object: {},
  Array: [],
  Function: function () {},
  Function: () => {},
  Function: class {},
  Set: new Set(),
  Map: new Map(),
  Symbol: Symbol(),
  String: '',
  Number: 0,
  Boolean: false
};

const testFunc = isType;

describe('given the isType function', () => {
  Object.entries(types).forEach(([key, value]) => {
    it(`given key "${key}" and value of that type, when isType(key, value), then returns true`, () => {
      expect(testFunc(key, value)).toBe(true);
    });
  });
});
