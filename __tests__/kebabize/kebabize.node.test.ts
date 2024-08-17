import { kebabize } from '../../src';

describe('kebabize', () => {
  
  it('should convert a camelCase string to kebab-case', () => {
    expect(kebabize('myVariableName')).toBe('my-variable-name');
  });

  it('should convert a PascalCase string to kebab-case', () => {
    expect(kebabize('MyVariableName')).toBe('my-variable-name');
  });

  it('should handle strings with a single uppercase letter', () => {
    expect(kebabize('A')).toBe('a');
  });

  it('should handle strings with a single lowercase letter', () => {
    expect(kebabize('a')).toBe('a');
  });

  it('should handle strings that are already kebab-case', () => {
    expect(kebabize('my-variable-name')).toBe('my-variable-name');
  });

  it('should handle strings with no uppercase letters', () => {
    expect(kebabize('myvariablename')).toBe('myvariablename');
  });

  it('should handle strings with multiple uppercase letters in a row', () => {
    expect(kebabize('myXMLHttpRequest')).toBe('my-x-m-l-http-request');
  });

  it('should handle strings with numbers (numbers should not be affected)', () => {
    expect(kebabize('myVariable1Name')).toBe('my-variable1-name');
  });

  it('should handle strings that start with an uppercase letter', () => {
    expect(kebabize('MyVariableName')).toBe('my-variable-name');
  });

  it('should handle empty strings', () => {
    expect(kebabize('')).toBe('');
  });
  
});
