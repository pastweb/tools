import { describe, it, expect } from 'vitest';
import { isSSR } from '../../src';

describe('isSSR server side', () => {
  it('isSSR should be true', () => {
    expect(isSSR).toBe(true);
  });
});
