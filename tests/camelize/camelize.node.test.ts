import { describe, it, expect } from 'vitest';
import { camelize } from '../../src/camelize';

describe('given the camelize function', () => {
  it('given a string containing spaces, when camelize is called, then it correctly camelizes it', () => {
    const input = 'this is the string with spaces';

    const output = camelize(input);

    expect(output).toBe('thisIsTheStringWithSpaces');
  });

  it('given a string containing hyphens, when camelize is called, then it correctly camelizes it', () => {
    const input = 'this-is-the-string-with-hyphens';

    const output = camelize(input);

    expect(output).toBe('thisIsTheStringWithHyphens');
  });

  it('given a string containing underscores, when camelize is called, then it correctly camelizes it', () => {
    const input = 'this_is_the_string_with_underscores';

    const output = camelize(input);

    expect(output).toBe('thisIsTheStringWithUnderscores');
  });

  it('given a string containing spaces, hyphens and underscores, when camelize is called, then it correctly camelizes it', () => {
    const input = 'this is the string _with _scpaces- hyphens_ and_underscores';

    const output = camelize(input);

    expect(output).toBe('thisIsTheStringWithScpacesHyphensAndUnderscores');
  });
});
