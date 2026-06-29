import { describe, it, expect, beforeEach } from 'vitest';
import { isObject, remove } from '../../src';

let testObj: Record<string, any> = {};

describe('given the remove function', () => {
  beforeEach(() => {
    testObj = {
      first: {
        second: {
          other: {}
        },
        third: 'sampleString',
        forth: 1,
        fifth: []
      }
    };
  });

  it('given testObj with first, when remove(testObj, "first"), then testObj.first is undefined', () => {
    remove(testObj, 'first');
    expect(testObj.first).toBeUndefined();
  });

  it('given deep, when remove "first.second.other", then other undefined but parents remain objects', () => {
    remove(testObj, 'first.second.other');
    expect(isObject(testObj.first)).toBe(true);
    expect(isObject(testObj.first.second)).toBe(true);
    expect(testObj.first.second).toBeDefined();
    expect(testObj.first.second.other).toBeUndefined();
  });

  it('given, when remove "first.third", then third undefined but first object', () => {
    remove(testObj, 'first.third');
    expect(isObject(testObj.first)).toBe(true);
    expect(testObj.first.third).toBeUndefined();
  });

  it('given, when remove "first.forth", then forth undefined, first object', () => {
    remove(testObj, 'first.forth');
    expect(isObject(testObj.first)).toBe(true);
    expect(testObj.first.forth).toBeUndefined();
  });

  it('given, when remove "first.fifth", then fifth undefined, first object', () => {
    remove(testObj, 'first.fifth');
    expect(isObject(testObj.first)).toBe(true);
    expect(testObj.first.fifth).toBeUndefined();
  });

  it('given remove with returnNew=true for "first", then returns new object ( !== original ) that is object', () => {
    const result = remove(testObj, 'first', true);
    expect(isObject(result)).toBe(true);
    expect(testObj !== result).toBe(true);
  });

  it('given remove returnNew "first", then result.first undefined', () => {
    const result = remove(testObj, 'first', true) as Record<string, any>;
    expect(result.first).toBeUndefined();
  });

  it('given remove returnNew deep "first.second.other", then result parents objects and .other undefined', () => {
    const result = remove(testObj, 'first.second.other', true) as Record<string, any>;
    expect(isObject(result.first)).toBe(true);
    expect(isObject(result.first.second)).toBe(true);
    expect(result.first.second).toBeDefined();
    expect(result.first.second.other).toBeUndefined();
  });
});
