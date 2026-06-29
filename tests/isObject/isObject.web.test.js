import { describe, it, expect } from 'vitest';
import { isObject } from '../../src';

const types = {
  Object: {},
  Class: class {},
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

const target = 'Object';
const testFunc = isObject;

describe('given the isObject function', () => {
  Object.entries(types).forEach(([key, value]) => {
    it(`given value of key "${key}", when isObject(value) for target Object, then returns true only for the Object case`, () => {
      expect(testFunc(value)).toBe(target === key ? true : false);
    });
  });
});
