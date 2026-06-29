import { describe, it, expect } from 'vitest';
import { isSSR } from '../../src';

describe('given isSSR on server side (node)', () => {
  it('when evaluated on server, then isSSR is true', () => {
    expect(isSSR).toBe(true);
  });
});
