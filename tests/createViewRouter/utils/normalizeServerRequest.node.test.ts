import { describe, it, expect } from 'vitest';
import { normalizeServerRequest } from '../../../src/createViewRouter/utils';

describe('normalizeServerRequest', () => {
  const makeReq = (overrides: any = {}) => ({
    url: '/test?foo=bar',
    method: 'GET',
    headers: { 'user-agent': 'test-agent', 'accept-language': 'en-US,en;q=0.9', 'sec-ch-prefers-color-scheme': 'dark' },
    ...overrides,
  });

  it('given a raw server request, when normalizeServerRequest processes it, then url, method, headers and other core fields are standardized', () => {
    const req = makeReq();
    const normalized = normalizeServerRequest(req as any);
    expect(normalized.url.pathname).toBe('/test');
    expect(normalized.method).toBe('GET');
    expect(normalized.userAgent).toBe('test-agent');
  });

  it('given Accept-Language header, when normalized, then language is set to the primary preferred language', () => {
    const req = makeReq();
    const normalized = normalizeServerRequest(req as any);
    expect(normalized.language).toBe('en-US');
  });

  it('given a User-Agent header, when normalized, then os is detected (with version when possible)', () => {
    const req = makeReq({ headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } });
    const normalized = normalizeServerRequest(req as any);
    expect(normalized.os).toBe('macOS 10.15.7');
  });

  it('given Sec-CH-Prefers-Color-Scheme or cookie, when normalized, then colorScheme is set to light/dark/no-preference', () => {
    const req = makeReq();
    const normalized = normalizeServerRequest(req as any);
    expect(normalized.colorScheme).toBe('dark');
  });

  it('given no color scheme info, when normalized, then colorScheme falls back to "no-preference"', () => {
    const req = makeReq({ headers: { 'user-agent': 'test' } });
    const normalized = normalizeServerRequest(req as any);
    expect(normalized.colorScheme).toBe('no-preference');
  });

  it('given x-forwarded-for or req.ip, when normalized, then the ip field is populated from the best available source', () => {
    const req = makeReq({ headers: { 'x-forwarded-for': '1.2.3.4' } });
    const normalized = normalizeServerRequest(req as any);
    expect(normalized.ip).toBe('1.2.3.4');
  });
});
