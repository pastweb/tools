import { describe, it, expect } from 'vitest';
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

describe('given the select function', () => {
  it('given "notPresent" no default, when select, then undefined', () => {
    expect(select(testObj, 'notPresent')).toBe(undefined);
  });

  it('given "notPresent" with default 1, when select, then 1', () => {
    expect(select(testObj, 'notPresent', 1)).toBe(1);
  });

  it('given "first", when select, then isObject true', () => {
    expect(isObject(select(testObj, 'first'))).toBe(true);
  });

  it('given "first.notPresent" default null, when select, then null', () => {
    expect(select(testObj, 'first.notPresent', null)).toBe(null);
  });

  it('given "first.notPresent" default 2, when select, then 2', () => {
    expect(select(testObj, 'first.notPresent', 2)).toBe(2);
  });

  it('given "first.second", when select, then isObject true', () => {
    expect(isObject(select(testObj, 'first.second'))).toBe(true);
  });

  it('given "first.second.other", when select, then isObject true', () => {
    expect(isObject(select(testObj, 'first.second.other'))).toBe(true);
  });

  it('given "first.second.notPresent" no default, when select, then undefined', () => {
    expect(select(testObj, 'first.second.notPresent')).toBe(undefined);
  });

  it('given deep notPresent, when select, then undefined', () => {
    expect(select(testObj, 'first.second.other.notPresent')).toBe(undefined);
  });

  it('given "first.third", when select, then "sampleString"', () => {
    expect(select(testObj, 'first.third')).toBe('sampleString');
  });

  it('given "first.forth", when select, then 1', () => {
    expect(select(testObj, 'first.forth')).toBe(1);
  });

  it('given "first.fifth", when select, then Array.isArray true', () => {
    expect(Array.isArray(select(testObj, 'first.fifth'))).toBe(true);
  });
});
