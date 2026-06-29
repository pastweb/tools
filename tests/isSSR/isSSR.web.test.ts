import { describe, it, expect } from 'vitest';
import { isSSR } from '../../src';

describe('given isSSR on client side (web)', () => {
  it('when evaluated on client, then isSSR is false (note: title said true but asserts false)', () => {
    expect(isSSR).toBe(false);
  });
});
