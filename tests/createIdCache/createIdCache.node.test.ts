import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createIdCache,
  cacheIds,
  CUSTOM_ELEMENTS_SCOPE,
  CUSTOM_ELEMENT_ALPHABET,
} from '../../src/createIdCache';
import { hashID } from '../../src/hashID';

vi.mock('../../src/hashID', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/hashID')>();
  return {
    ...actual,
    hashID: vi.fn(),
  };
});

describe('given the createIdCache factory', () => {
  let idCache: ReturnType<typeof createIdCache>;
  const scope1 = Symbol('scope1');
  const scope2 = Symbol('scope2');
  const newScope = Symbol('new-scope');
  const missingScope = Symbol('non-existent-scope');

  beforeEach(() => {
    cacheIds.clear();
    idCache = createIdCache();
    vi.clearAllMocks();
  });

  describe('getId', () => {
    it('given a scope and HashIDOptions, when getId is called, then it returns the id, forwards options to hashID, and has() reports true', () => {
      vi.mocked(hashID).mockReturnValue('unique-id');

      const id = idCache.getId(scope1, { prefix: 'prefix' });

      expect(id).toBe('unique-id');
      expect(hashID).toHaveBeenCalledWith([], { prefix: 'prefix' });
      expect(idCache.has(scope1, 'unique-id')).toBe(true);
    });

    it('given full HashIDOptions, when getId is called, then hashID receives prefix, idLength, alphabet and retries', () => {
      vi.mocked(hashID).mockReturnValue('custom-id');
      const options = {
        prefix: 'el-',
        idLength: 12,
        alphabet: 'abc123',
        retries: 5,
      };

      const id = idCache.getId(scope1, options);

      expect(id).toBe('custom-id');
      expect(hashID).toHaveBeenCalledWith([], options);
    });

    it('given no options, when getId is called, then hashID is invoked with an empty options object', () => {
      vi.mocked(hashID).mockReturnValue('plain-id');

      const id = idCache.getId(scope1);

      expect(id).toBe('plain-id');
      expect(hashID).toHaveBeenCalledWith([], {});
    });

    it('given two different scopes, when getId is called for each, then each scope stores its own id', () => {
      vi.mocked(hashID)
        .mockReturnValueOnce('unique-id1')
        .mockReturnValueOnce('unique-id2');

      const id1 = idCache.getId(scope1, { prefix: 'prefix' });
      const id2 = idCache.getId(scope2, { prefix: 'prefix' });

      expect(id1).toBe('unique-id1');
      expect(id2).toBe('unique-id2');
      expect(idCache.has(scope1, 'unique-id1')).toBe(true);
      expect(idCache.has(scope2, 'unique-id2')).toBe(true);
    });

    it('given a new scope, when getId is called, then the scope is created and has() returns true', () => {
      vi.mocked(hashID).mockReturnValue('unique-id');

      idCache.getId(newScope, { prefix: 'prefix' });

      expect(idCache.has(newScope, 'unique-id')).toBe(true);
    });

    it('given an existing id in scope, when getId is called again, then hashID receives the cached ids list', () => {
      vi.mocked(hashID)
        .mockReturnValueOnce('first-id')
        .mockReturnValueOnce('second-id');

      idCache.getId(scope1, { prefix: 'a-' });
      idCache.getId(scope1, { prefix: 'b-', idLength: 6 });

      expect(hashID).toHaveBeenNthCalledWith(1, [], { prefix: 'a-' });
      expect(hashID).toHaveBeenNthCalledWith(2, ['first-id'], {
        prefix: 'b-',
        idLength: 6,
      });
    });
  });

  describe('removeId / has', () => {
    it('given an id stored for scope, when removeId is called, then has() returns false for that id', () => {
      vi.mocked(hashID).mockReturnValue('unique-id');
      idCache.getId(scope1, { prefix: 'prefix' });

      idCache.removeId(scope1, 'unique-id');

      expect(idCache.has(scope1, 'unique-id')).toBe(false);
    });

    it('given an id for scope, when removeId is called for a non-existent id, then the original id remains', () => {
      vi.mocked(hashID).mockReturnValue('unique-id');
      idCache.getId(scope1, { prefix: 'prefix' });

      idCache.removeId(scope1, 'non-existent-id');

      expect(idCache.has(scope1, 'unique-id')).toBe(true);
    });

    it('given no ids for a scope, when has is called, then it returns false', () => {
      expect(idCache.has(missingScope, 'some-id')).toBe(false);
    });

    it('given an id stored in scope, when has is called for a different id, then it returns false', () => {
      vi.mocked(hashID).mockReturnValue('unique-id');
      idCache.getId(scope1, { prefix: 'prefix' });

      expect(idCache.has(scope1, 'non-existent-id')).toBe(false);
    });
  });

  describe('getCustomElementName', () => {
    it('given default options, when getCustomElementName is called, then it uses suffix mode and CUSTOM_ELEMENT_ALPHABET via hashID', () => {
      vi.mocked(hashID).mockReturnValue('my-el_kmpqrsab');

      const tag = idCache.getCustomElementName('my-el');

      expect(tag).toBe('my-el_kmpqrsab');
      expect(hashID).toHaveBeenCalledWith([], {
        alphabet: CUSTOM_ELEMENT_ALPHABET,
        prefix: 'my-el',
      });
      expect(idCache.has(CUSTOM_ELEMENTS_SCOPE, tag)).toBe(true);
    });

    it('given a name without a hyphen and position suffix, when called, then a hyphen is inserted in the hashID prefix', () => {
      vi.mocked(hashID).mockReturnValue('app-_kmpqrsab');

      const tag = idCache.getCustomElementName('app', { position: 'suffix' });

      expect(tag).toBe('app-_kmpqrsab');
      expect(hashID).toHaveBeenCalledWith([], {
        alphabet: CUSTOM_ELEMENT_ALPHABET,
        prefix: 'app-',
      });
    });

    it('given position prefix, when getCustomElementName is called, then the unique code comes first and the base name last', () => {
      vi.mocked(hashID).mockReturnValue('_kmpqrsab');

      const tag = idCache.getCustomElementName('panel', { position: 'prefix' });

      expect(tag).toBe('kmpqrsab-panel');
      expect(tag).toMatch(/^[a-z].*-panel$/);
      expect(hashID).toHaveBeenCalledWith([], {
        alphabet: CUSTOM_ELEMENT_ALPHABET,
      });
      expect(idCache.has(CUSTOM_ELEMENTS_SCOPE, tag)).toBe(true);
      expect(idCache.has(CUSTOM_ELEMENTS_SCOPE, '_kmpqrsab')).toBe(false);
    });

    it('given a custom alphabet option, when getCustomElementName is called, then hashID receives that alphabet', () => {
      vi.mocked(hashID).mockReturnValue('my-el_ab');

      idCache.getCustomElementName('my-el', { alphabet: 'ab' });

      expect(hashID).toHaveBeenCalledWith([], {
        alphabet: 'ab',
        prefix: 'my-el',
      });
    });

    it('given position and alphabet together, when getCustomElementName is called with prefix, then both options apply', () => {
      vi.mocked(hashID).mockReturnValue('_zz');

      const tag = idCache.getCustomElementName('host', {
        position: 'prefix',
        alphabet: 'z',
      });

      expect(tag).toBe('zz-host');
      expect(hashID).toHaveBeenCalledWith([], { alphabet: 'z' });
    });

    it('given repeated calls, when getCustomElementName runs, then each composed name is unique', () => {
      vi.mocked(hashID)
        .mockReturnValueOnce('item-_aaa')
        .mockReturnValueOnce('item-_bbb')
        .mockReturnValueOnce('_ccc')
        .mockReturnValueOnce('_ddd');

      const tags = [
        idCache.getCustomElementName('item'),
        idCache.getCustomElementName('item'),
        idCache.getCustomElementName('item', { position: 'prefix' }),
        idCache.getCustomElementName('item', { position: 'prefix' }),
      ];

      expect(new Set(tags).size).toBe(4);
      expect(tags).toEqual(['item-_aaa', 'item-_bbb', 'ccc-item', 'ddd-item']);
    });

    it('given mixed case input, when getCustomElementName is called, then the base name is lowercased', () => {
      vi.mocked(hashID).mockReturnValue('my-button_xyz');

      const tag = idCache.getCustomElementName('My-Button');

      expect(tag).toBe('my-button_xyz');
      expect(hashID).toHaveBeenCalledWith([], {
        alphabet: CUSTOM_ELEMENT_ALPHABET,
        prefix: 'my-button',
      });
    });

    it('given CUSTOM_ELEMENT_ALPHABET, when inspected, then it is lowercase a-z only', () => {
      expect(CUSTOM_ELEMENT_ALPHABET).toBe('abcdefghijklmnopqrstuvwxyz');
    });
  });
});
