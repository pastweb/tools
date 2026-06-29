import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createIdCache } from '../../src';
import { hashID } from '../../src/hashID';

// Mock the hashID function
vi.mock('../../src/hashID', () => ({
  hashID: vi.fn(),
}));

describe('given the createIdCache factory', () => {
  let idCache: ReturnType<typeof createIdCache>;

  beforeEach(() => {
    idCache = createIdCache();
    vi.clearAllMocks();
  });

  it('given a scope and prefix, when getId is called (with hashID mocked), then it returns the id, calls hashID correctly and has() reports true for it', () => {
    vi.mocked(hashID).mockReturnValue('unique-id');
    const id = idCache.getId('scope1', 'prefix');
    expect(id).toBe('unique-id');
    expect(hashID).toHaveBeenCalledWith([], { prefix: 'prefix' });
    expect(idCache.has('scope1', 'unique-id')).toBe(true);
  });

  it('given an id stored for scope, when removeId is called, then has() returns false for that id in scope', () => {
    vi.mocked(hashID).mockReturnValue('unique-id');
    const id = idCache.getId('scope1', 'prefix');
    expect(idCache.has('scope1', 'unique-id')).toBe(true);
    idCache.removeId('scope1', 'unique-id');
    expect(idCache.has('scope1', 'unique-id')).toBe(false);
  });

  it('given id for scope, when removeId is called for non-existent id, then the original id is still present (has true)', () => {
    vi.mocked(hashID).mockReturnValue('unique-id');
    idCache.getId('scope1', 'prefix');
    idCache.removeId('scope1', 'non-existent-id');
    expect(idCache.has('scope1', 'unique-id')).toBe(true);
  });

  it('given no ids for a scope, when has is called for non-existent scope, then it returns false', () => {
    expect(idCache.has('non-existent-scope', 'some-id')).toBe(false);
  });

  it('given an id stored in scope, when has is called for different id in that scope, then it returns false', () => {
    vi.mocked(hashID).mockReturnValue('unique-id');
    idCache.getId('scope1', 'prefix');
    expect(idCache.has('scope1', 'non-existent-id')).toBe(false);
  });

  it('given two different scopes, when getId called for each (with sequential mocks), then different ids are returned and each has() true in own scope', () => {
    vi.mocked(hashID)
      .mockReturnValueOnce('unique-id1')
      .mockReturnValueOnce('unique-id2');
      
    const id1 = idCache.getId('scope1', 'prefix');
    const id2 = idCache.getId('scope2', 'prefix');
    
    expect(id1).toBe('unique-id1');
    expect(id2).toBe('unique-id2');
    expect(idCache.has('scope1', 'unique-id1')).toBe(true);
    expect(idCache.has('scope2', 'unique-id2')).toBe(true);
  });

  it('given a new scope not seen before, when getId called, then has() for it returns true (scope is added)', () => {
    vi.mocked(hashID).mockReturnValue('unique-id');
    idCache.getId('new-scope', 'prefix');
    expect(idCache.has('new-scope', 'unique-id')).toBe(true);
  });
});
