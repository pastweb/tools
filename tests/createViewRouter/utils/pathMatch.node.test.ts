import { describe, it, expect } from 'vitest';
import { pathMatch, pathToRegExp } from '../../src/createViewRouter/utils';

describe('pathMatch', () => {
  it('given a route pattern with :named params and a concrete path, when pathMatch runs, then it returns match info with extracted params', () => {
    const path = '/user/:name';
    const regexp = pathToRegExp(path);
    const params = pathMatch(path, regexp, '/user/alice');

    expect(params).toEqual({ name: 'alice' });
  });

  it('given patterns with optional params, when matching paths that include or omit them, then params are present only when supplied', () => {
    const path = '/user/:name?';
    const regexp = pathToRegExp(path);

    expect(pathMatch(path, regexp, '/user')).toEqual({});
    expect(pathMatch(path, regexp, '/user/bob')).toEqual({ name: 'bob' });
  });

  it('given a * catch-all pattern, when matched against a path, then the catch-all param is an array of segments', () => {
    const path = '/blog/*slug';
    const regexp = pathToRegExp(path);
    const params = pathMatch(path, regexp, '/blog/a/b/c');

    expect(params).toEqual({ slug: ['a', 'b', 'c'] });
  });

  it('given a pattern and a non-matching path, when pathMatch is called, then it returns false', () => {
    const path = '/about';
    const regexp = pathToRegExp(path);
    expect(pathMatch(path, regexp, '/home')).toBe(false);
  });

  it('given param values that look like bools/numbers, when matched, then pathMatch normalizes them using the param normalizer', () => {
    const path = '/item/:id/:active';
    const regexp = pathToRegExp(path);
    const params = pathMatch(path, regexp, '/item/42/true');

    expect(params).toEqual({ id: 42, active: true });
  });
});
