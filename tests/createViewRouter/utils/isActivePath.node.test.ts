import { describe, it, expect } from 'vitest';
import { isActivePath } from '../../../src/createViewRouter/utils';

describe('isActivePath', () => {
  it('given a link path that is a string prefix of a sibling path, when isActivePath is called, then it is not active', () => {
    expect(isActivePath('/dropdown', '/dropdownmenu')).toBe(false);
    expect(isActivePath('/dropdpwn', '/dropdpwnmenu')).toBe(false);
  });

  it('given a link path that is an ancestor of the current pathname, when isActivePath is called, then it is active', () => {
    expect(isActivePath('/blog', '/blog/post')).toBe(true);
    expect(isActivePath('/blog/', '/blog/post')).toBe(true);
  });

  it('given a link path that exactly matches the current pathname, when isActivePath is called, then it is active', () => {
    expect(isActivePath('/dropdownmenu', '/dropdownmenu')).toBe(true);
    expect(isActivePath('/dropdown', '/dropdown/')).toBe(true);
  });

  it('given a root link path, when the current pathname is a nested route, then it is active', () => {
    expect(isActivePath('/', '/')).toBe(true);
    expect(isActivePath('/', '/about')).toBe(true);
  });

  it('given a link path with query or hash, when isActivePath is called, then only the pathname is compared', () => {
    expect(isActivePath('/blog?tab=1', '/blog/post')).toBe(true);
    expect(isActivePath('/dropdown#open', '/dropdownmenu')).toBe(false);
  });

  it('given sensitive matching is disabled, when the paths differ only by case, then it is active', () => {
    expect(isActivePath('/Blog', '/blog/post')).toBe(true);
  });

  it('given sensitive matching is enabled, when the paths differ only by case, then it is not active', () => {
    expect(isActivePath('/Blog', '/blog/post', { sensitive: true })).toBe(false);
  });
});
