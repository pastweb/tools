import { describe, it, expect } from 'vitest';
import { getType } from '../../src';

class MyClass {}

const types = [
  { type: 'Object', value: {} },
  { type: 'Object', value: new MyClass() },
  { type: 'Array', value: [] },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  { type: 'Function', value: function () {} },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  { type: 'Function', value: () => {} },
  { type: 'Function', value: class {} },
  { type: 'Set', value: new Set() },
  { type: 'Map', value: new Map() },
  { type: 'Symbol', value: Symbol() },
  { type: 'String', value: '' },
  { type: 'Number', value: 0 },
  { type: 'Number', value: NaN },
  { type: 'Boolean', value: false },
  { type: 'Undefined', value: undefined },
  { type: 'Null', value: null },
  { type: 'BigInt', value: BigInt(0) }
];

describe('given the getType function', () => {
  types.forEach(({ type, value }) => {
    it(`given a value of type "${type}", when getType called, then it returns the correct "${type}"`, () => {
      expect(getType(value)).toBe(type);
    });
  });
});
