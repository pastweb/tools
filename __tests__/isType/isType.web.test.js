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

describe('isType', () => {
  Object.entries(types).forEach(([key, value]) => {
    it(`should return true for a target "${key}"`, () => {
      expect(testFunc(key, value)).toBe(true);
    });
  });
});
