import { hashID } from '../../src';

describe('hashID', () => {
  it('should be a function', () => {
    expect(typeof hashID).toBe('function');
  });

  it('should generates a string 8 char long.', () => {
    expect(hashID().length).toBe(8);
  });

  it('should generates a string 6 char long.', () => {
    expect(hashID(null, { idLength: 6 }).length).toBe(6);
  });

  it('should generates a string with "_" as first char.', () => {
    expect(hashID().indexOf('_')).toBe(0);
  });

  it('should generate an ID string with "PREFIX" as prefix.', () => {
    expect(hashID(null, { prefix: 'PREFIX' }).indexOf('PREFIX')).toBe(0);
  });

  it('the id shuold be not in the cache.', () => {
    const cache: string[] = [];

    for(let i = 0; i < 500; i++) {
      cache.push(hashID(cache));
    }

    expect(cache.includes(hashID(cache))).toBe(false);
  });
});
