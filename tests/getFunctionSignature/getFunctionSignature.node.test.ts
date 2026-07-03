import { describe, expect, it } from 'vitest';
import { getFunctionSignature } from '../../src';

describe('given the getFunctionSignature function', () => {
  it('given a regular function, when getFunctionSignature is called, then it returns the function source', () => {
    function namedFunction() {
      return 'value';
    }

    expect(getFunctionSignature(namedFunction)).toBe(Function.prototype.toString.call(namedFunction));
  });

  it('given two different function bodies, when getFunctionSignature is called, then it returns different signatures', () => {
    const first = () => 'first';
    const second = () => 'second';

    expect(getFunctionSignature(first)).not.toBe(getFunctionSignature(second));
  });

  it('given non-function values, when getFunctionSignature is called, then it returns an empty string', () => {
    expect(getFunctionSignature(null)).toBe('');
    expect(getFunctionSignature({})).toBe('');
    expect(getFunctionSignature('function text')).toBe('');
  });
});
