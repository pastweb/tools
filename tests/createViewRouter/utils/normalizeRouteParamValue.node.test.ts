import { describe, it, expect } from 'vitest';
import { normalizeRouteParamValue } from '../../../src/createViewRouter/utils';

describe('normalizeRouteParamValue', () => {
  it('given the string "true" or "false", when normalizeRouteParamValue is called, then it returns the boolean primitive', () => {
    expect(normalizeRouteParamValue('true')).toBe(true);
    expect(normalizeRouteParamValue('false')).toBe(false);
    expect(normalizeRouteParamValue('TRUE')).toBe(true);
    expect(normalizeRouteParamValue('False')).toBe(false);
  });

  it('given a numeric string like "42", when normalized, then it becomes the number 42', () => {
    expect(normalizeRouteParamValue('42')).toBe(42);
    expect(normalizeRouteParamValue('3.14')).toBe(3.14);
    expect(normalizeRouteParamValue('-100')).toBe(-100);
  });

  it('given the strings "null" or "undefined", when normalized, then actual null or undefined is returned', () => {
    expect(normalizeRouteParamValue('null')).toBe(null);
    expect(normalizeRouteParamValue('undefined')).toBe(undefined);
  });

  it('given an arbitrary string that is not special, when normalized, then the original string is returned unchanged', () => {
    expect(normalizeRouteParamValue('hello')).toBe('hello');
    expect(normalizeRouteParamValue('123abc')).toBe('123abc');
    expect(normalizeRouteParamValue('')).toBe('');
  });

  it('given empty string or whitespace, when normalized as potential number, then it stays a string (no coercion to 0 or NaN)', () => {
    expect(normalizeRouteParamValue('   ')).toBe('   ');
    expect(normalizeRouteParamValue('0')).toBe(0); // valid number
  });
});
