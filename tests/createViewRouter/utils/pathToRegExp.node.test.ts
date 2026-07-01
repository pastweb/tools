import { describe, it, expect } from 'vitest';
import { pathToRegExp } from '../../../src/createViewRouter/utils';

describe('pathToRegExp', () => {
  it('given a simple path pattern, when turned into regexp by pathToRegExp, then it matches concrete paths and extracts no params', () => {
    const re = pathToRegExp('/about');
    expect(re.test('/about')).toBe(true);
    expect(re.test('/about/')).toBe(false); // default end=true
    expect(re.test('/home')).toBe(false);
  });

  it('given a pattern with :param, when compiled and matched, then the regexp works and named groups or custom logic extract the value', () => {
    const re = pathToRegExp('/user/:id');
    const match = re.exec('/user/123');
    expect(match?.[1]).toBe('123');
  });

  it('given optional :param? syntax, when the regexp is tested, then it matches paths with and without the segment', () => {
    const re = pathToRegExp('/user/:id?');
    expect(re.test('/user')).toBe(true);
    expect(re.test('/user/42')).toBe(true);
  });

  it('given * catch all, when the generated regexp matches, then it captures the remainder as array or string appropriately', () => {
    const re = pathToRegExp('/blog/*slug');
    const match = re.exec('/blog/a/b/c');
    expect(match?.[1]).toBe('a/b/c');
  });

  it('given optional catch-all forms, when used in matching, then the regexp allows the trailing part to be absent', () => {
    const re = pathToRegExp('/files/?*path');
    expect(re.test('/files')).toBe(true);
    expect(re.test('/files/a/b')).toBe(true);
  });

  it('given sensitive: true option, when the regexp is built, then matching is case-sensitive', () => {
    const reSensitive = pathToRegExp('/About', { sensitive: true });
    const reInsensitive = pathToRegExp('/About', { sensitive: false });

    expect(reSensitive.test('/About')).toBe(true);
    expect(reSensitive.test('/about')).toBe(false);

    expect(reInsensitive.test('/about')).toBe(true);
  });

  it('given start/end options to pathToRegExp, when building the regexp, then ^ and $ anchors are applied as specified', () => {
    const re = pathToRegExp('about', { start: false, end: false });
    expect(re.test('/foo/about/bar')).toBe(true);
  });
});
