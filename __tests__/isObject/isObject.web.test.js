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

describe('isObject', () => {
  Object.entries(types).forEach(([key, value]) => {
    it(`should return ${
      target === key ? 'true' : 'false'
    } for a target "${target}"`, () => {
      expect(testFunc(value)).toBe(target === key ? true : false);
    });
  });
});
