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
  { type: 'Boolean', value: false }
];

describe('getType', () => {
  types.forEach(({ type, value }) => {
    it(`for the target "${type}" the type should be correct`, () => {
      expect(getType(value)).toBe(type);
    });
  });
});
