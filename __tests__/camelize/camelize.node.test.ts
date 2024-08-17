import { camelize } from '../../src/camelize';

describe('camelize', () => {
  it('should camelize correctly the string which contains spaces.', () => {
    const input = 'this is the string with spaces';

    const output = camelize(input);

    expect(output).toBe('thisIsTheStringWithSpaces');
  });

  it('should camelize correctly the string which contains hyphens.', () => {
    const input = 'this-is-the-string-with-hyphens';

    const output = camelize(input);

    expect(output).toBe('thisIsTheStringWithHyphens');
  });

  it('should camelize correctly the string which contains underscores.', () => {
    const input = 'this_is_the_string_with_underscores';

    const output = camelize(input);

    expect(output).toBe('thisIsTheStringWithUnderscores');
  });

  it('should camelize correctly the string which contains scpaces, hyphens and underscores.', () => {
    const input = 'this is the string _with _scpaces- hyphens_ and_underscores';

    const output = camelize(input);

    expect(output).toBe('thisIsTheStringWithScpacesHyphensAndUnderscores');
  });
});