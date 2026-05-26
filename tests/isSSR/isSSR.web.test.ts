import { describe, it, expect } from 'vitest';
import { isSSR } from '../../src';

describe('isSSR client side', () => {
  it('isSSR should be true', () => {
    expect(isSSR).toBe(false);
  });
});
