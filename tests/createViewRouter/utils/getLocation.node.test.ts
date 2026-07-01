import { describe, it, expect } from 'vitest';
import { getLocation } from '../../../src/createViewRouter/utils';

describe('getLocation', () => {
  it('given a full URL string, when getLocation is called, then it returns a parsed object with pathname, search, hash, etc.', () => {
    const loc = getLocation('https://example.com:8080/path/to/page?query=1&foo=bar#section1', 'test-agent');

    expect(loc).toMatchObject({
      href: 'https://example.com:8080/path/to/page?query=1&foo=bar#section1',
      origin: 'https://example.com:8080',
      protocol: 'https',
      host: 'example.com:8080',
      hostname: 'example.com',
      port: 8080,
      pathname: '/path/to/page',
      hash: 'section1',
      userAgent: 'test-agent',
    });

    expect(loc.searchParams.get('query')).toBe('1');
    expect(loc.searchParams.get('foo')).toBe('bar');
  });

  it('given a root path or incomplete URL, when getLocation parses it, then defaults are applied for origin, port, etc.', () => {
    const loc = getLocation('http://localhost', '');

    expect(loc.pathname).toBe('/');
    expect(loc.searchParams.toString()).toBe('');
    expect(loc.hash).toBe('');
    expect(loc.port).toBe(80);
  });

  it('given a path without origin (e.g. just /foo), when parsed, then origin and host are empty or derived reasonably', () => {
    const loc = getLocation('/some/path?x=1', 'ua');

    expect(loc.pathname).toBe('/some/path');
    expect(loc.origin).toBe('');
    expect(loc.host).toBe('');
  });

  it('given URLs with explicit or implicit port, when getLocation runs, then port is extracted or defaults to 80', () => {
    const loc1 = getLocation('http://example.com:3000', '');
    expect(loc1.port).toBe(3000);

    const loc2 = getLocation('http://example.com', '');
    expect(loc2.port).toBe(80);
  });
});
