import { createIdCache } from '../../src';
import { hashID } from '../../src/hashID';

// Mock the hashID function
jest.mock('../../src/hashID', () => ({
  hashID: jest.fn(),
}));

describe('createIdCache', () => {
  let idCache: ReturnType<typeof createIdCache>;

  beforeEach(() => {
    idCache = createIdCache();
    jest.clearAllMocks();
  });

  it('should generate and store a unique ID for a given scope', () => {
    (hashID as jest.Mock).mockReturnValue('unique-id');
    const id = idCache.getId('scope1', 'prefix');
    expect(id).toBe('unique-id');
    expect(hashID).toHaveBeenCalledWith([], { prefix: 'prefix' });
    expect(idCache.has('scope1', 'unique-id')).toBe(true);
  });

  it('should remove an ID from the given scope', () => {
    (hashID as jest.Mock).mockReturnValue('unique-id');
    const id = idCache.getId('scope1', 'prefix');
    expect(idCache.has('scope1', 'unique-id')).toBe(true);
    idCache.removeId('scope1', 'unique-id');
    expect(idCache.has('scope1', 'unique-id')).toBe(false);
  });

  it('should handle removing an ID that does not exist', () => {
    (hashID as jest.Mock).mockReturnValue('unique-id');
    idCache.getId('scope1', 'prefix');
    idCache.removeId('scope1', 'non-existent-id');
    expect(idCache.has('scope1', 'unique-id')).toBe(true);
  });

  it('should return false for a non-existent scope', () => {
    expect(idCache.has('non-existent-scope', 'some-id')).toBe(false);
  });

  it('should return false for a non-existent ID within an existing scope', () => {
    (hashID as jest.Mock).mockReturnValue('unique-id');
    idCache.getId('scope1', 'prefix');
    expect(idCache.has('scope1', 'non-existent-id')).toBe(false);
  });

  it('should create unique IDs for different scopes', () => {
    (hashID as jest.Mock)
      .mockReturnValueOnce('unique-id1')
      .mockReturnValueOnce('unique-id2');
      
    const id1 = idCache.getId('scope1', 'prefix');
    const id2 = idCache.getId('scope2', 'prefix');
    
    expect(id1).toBe('unique-id1');
    expect(id2).toBe('unique-id2');
    expect(idCache.has('scope1', 'unique-id1')).toBe(true);
    expect(idCache.has('scope2', 'unique-id2')).toBe(true);
  });

  it('should add a new scope if it does not exist', () => {
    (hashID as jest.Mock).mockReturnValue('unique-id');
    idCache.getId('new-scope', 'prefix');
    expect(idCache.has('new-scope', 'unique-id')).toBe(true);
  });
});
