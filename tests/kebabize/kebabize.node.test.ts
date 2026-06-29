import { describe, it, expect } from 'vitest';
import { kebabize } from '../../src';

describe('given the kebabize function', () => {
  
  it('given camelCase "myVariableName", when kebabize, then "my-variable-name"', () => {
    expect(kebabize('myVariableName')).toBe('my-variable-name');
  });

  it('given Pascal "MyVariableName", when kebabize, then "my-variable-name"', () => {
    expect(kebabize('MyVariableName')).toBe('my-variable-name');
  });

  it('given "A", when kebabize, then "a"', () => {
    expect(kebabize('A')).toBe('a');
  });

  it('given "a", when kebabize, then "a"', () => {
    expect(kebabize('a')).toBe('a');
  });

  it('given "my-variable-name", when kebabize, then unchanged', () => {
    expect(kebabize('my-variable-name')).toBe('my-variable-name');
  });

  it('given all lower "myvariablename", when kebabize, then unchanged', () => {
    expect(kebabize('myvariablename')).toBe('myvariablename');
  });

  it('given "myXMLHttpRequest", when kebabize, then "my-x-m-l-http-request"', () => {
    expect(kebabize('myXMLHttpRequest')).toBe('my-x-m-l-http-request');
  });

  it('given "myVariable1Name", when kebabize, then "my-variable1-name" (nums preserved)', () => {
    expect(kebabize('myVariable1Name')).toBe('my-variable1-name');
  });

  it('given starting upper (already covered), when kebabize "MyVariableName", then "my-variable-name"', () => {
    expect(kebabize('MyVariableName')).toBe('my-variable-name');
  });

  it('given "", when kebabize, then ""', () => {
    expect(kebabize('')).toBe('');
  });
  
});
