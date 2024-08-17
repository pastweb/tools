import { isObject, select } from '../../src';

const testObj = {
  first: {
    second: {
      other: {}
    },
    third: 'sampleString',
    forth: 1,
    fifth: []
  }
};

describe('select', () => {
  it('"notPresent" should return undefined as default value', () => {
    expect(select(testObj, 'notPresent')).toBe(undefined);
  });

  it('"notPresent" shoulds return 1 as default', () => {
    expect(select(testObj, 'notPresent', 1)).toBe(1);
  });

  it('"first" should returns an Object', () => {
    expect(isObject(select(testObj, 'first'))).toBe(true);
  });

  it('"first.notPresent" should returns null as default value', () => {
    expect(select(testObj, 'first.notPresent', null)).toBe(null);
  });

  it('"first.notPresent" should returns 2 as default value', () => {
    expect(select(testObj, 'first.notPresent', 2)).toBe(2);
  });

  it('"first.second" should returns an object as value', () => {
    expect(isObject(select(testObj, 'first.second'))).toBe(true);
  });

  it('"first.second.other" should returns an object as value', () => {
    expect(isObject(select(testObj, 'first.second.other'))).toBe(true);
  });

  it('"first.second.notPresent" should returns undefined as value', () => {
    expect(select(testObj, 'first.second.notPresent')).toBe(undefined);
  });

  it('"first.second.other.notPresent" should returns undefined as value', () => {
    expect(select(testObj, 'first.second.other.notPresent')).toBe(undefined);
  });

  it('"first.third" should returns "sampleString" as value', () => {
    expect(select(testObj, 'first.third')).toBe('sampleString');
  });

  it('"first.forth" should returns 1 as value', () => {
    expect(select(testObj, 'first.forth')).toBe(1);
  });

  it('"first.fifth" should returns an array as value', () => {
    expect(Array.isArray(select(testObj, 'first.fifth'))).toBe(true);
  });
});
