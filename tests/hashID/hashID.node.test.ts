import { describe, it, expect } from 'vitest';
import { hashID } from '../../src';

describe('given the hashID function', () => {
  it('when typeof hashID, then it is "function"', () => {
    expect(typeof hashID).toBe('function');
  });

  it('when hashID() default, then length is 8', () => {
    expect(hashID().length).toBe(8);
  });

  it('given {idLength:6}, when hashID(null, opts), then length 6', () => {
    expect(hashID(null, { idLength: 6 }).length).toBe(6);
  });

  it('when hashID(), then first char is "_"', () => {
    expect(hashID().indexOf('_')).toBe(0);
  });

  it('given {prefix:"PREFIX"}, when hashID, then starts with "PREFIX"', () => {
    expect(hashID(null, { prefix: 'PREFIX' }).indexOf('PREFIX')).toBe(0);
  });

  it('given a cache array populated by calling hashID(cache) 500 times, when check includes(hashID(cache)), then false (unique)', () => {
    const cache: string[] = [];

    for(let i = 0; i < 500; i++) {
      cache.push(hashID(cache));
    }

    expect(cache.includes(hashID(cache))).toBe(false);
  });
});
