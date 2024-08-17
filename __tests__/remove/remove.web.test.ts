import { isObject, remove } from '../../src';

let testObj: Record<string, any> = {};

describe('remove', () => {
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

  it('"first" should be not defined', () => {
    remove(testObj, 'first');
    expect(testObj.first).toBeUndefined();
  });

  it('"first.second.other" to be not defined', () => {
    remove(testObj, 'first.second.other');
    expect(isObject(testObj.first)).toBe(true);
    expect(isObject(testObj.first.second)).toBe(true);
    expect(testObj.first.second).toBeDefined();
    expect(testObj.first.second.other).toBeUndefined();
  });

  it('"first.third" to be not defined', () => {
    remove(testObj, 'first.third');
    expect(isObject(testObj.first)).toBe(true);
    expect(testObj.first.third).toBeUndefined();
  });

  it('"first.forth" to be not defined', () => {
    remove(testObj, 'first.forth');
    expect(isObject(testObj.first)).toBe(true);
    expect(testObj.first.forth).toBeUndefined();
  });

  it('"first.fifth" to be not defined', () => {
    remove(testObj, 'first.fifth');
    expect(isObject(testObj.first)).toBe(true);
    expect(testObj.first.fifth).toBeUndefined();
  });

  it('should return a new Object.', () => {
    const result = remove(testObj, 'first', true);
    expect(isObject(result)).toBe(true);
    expect(testObj !== result).toBe(true);
  });

  it('should return a new Objects where "first" should be not defined', () => {
    const result = remove(testObj, 'first', true) as Record<string, any>;
    expect(result.first).toBeUndefined();
  });

  it('should return a new Objects where "first.second.other" to be not defined', () => {
    const result = remove(testObj, 'first.second.other', true) as Record<string, any>;
    expect(isObject(result.first)).toBe(true);
    expect(isObject(result.first.second)).toBe(true);
    expect(result.first.second).toBeDefined();
    expect(result.first.second.other).toBeUndefined();
  });
});
