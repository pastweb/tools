import { hashID, type HashIDOptions } from '../hashID';
import {
  cacheIds,
  CUSTOM_ELEMENT_ALPHABET,
  CUSTOM_ELEMENTS_SCOPE,
} from './constants';
import type { GetCustomElementNameOptions, IdCache } from './types';

/**
 * Creates a cache for managing unique IDs within different scopes.
 *
 * @returns An object containing methods to interact with the ID cache.
 *
 * @example
 * ```ts
 * const idCache = createIdCache();
 * const id1 = idCache.getId(Symbol('scope1'), { prefix: 'el-' });
 * ```
 *
 * @example
 * ```ts
 * const idCache = createIdCache();
 * const tag = idCache.getCustomElementName('my-el');
 * // e.g. "my-el_kmpqrsab"
 * const tag2 = idCache.getCustomElementName('panel', { position: 'prefix' });
 * // e.g. "kmpqrsab-panel"
 * ```
 */
export function createIdCache(): IdCache {
  /**
   * Generates and retrieves a unique ID for a given scope.
   *
   * Options are passed through to {@link hashID} (for example `prefix`,
   * `idLength`, `alphabet`, `retries`).
   *
   * @param scopeName - The symbol representing the scope for which to generate the ID.
   * @param options - Optional {@link HashIDOptions} for ID generation.
   * @returns The generated unique ID.
   */
  function getId(scopeName: symbol, options: HashIDOptions = {}): string {
    if (!cacheIds.has(scopeName)) {
      cacheIds.set(scopeName, new Set());
    }

    const ids = cacheIds.get(scopeName) as Set<string>;
    const id = hashID([...ids], options);
    ids.add(id);

    return id;
  }

  /**
   * Builds a unique custom element tag name using {@link getId} and
   * {@link CUSTOM_ELEMENT_ALPHABET} (overridable via `options.alphabet`).
   *
   * @param name - Base name segment (normalized to lowercase).
   * @param options - `position` (`'suffix'` default) and optional `alphabet`.
   * @returns A unique custom element name candidate.
   */
  function getCustomElementName(
    name: string,
    options: GetCustomElementNameOptions = {},
  ): string {
    const { position = 'suffix', alphabet = CUSTOM_ELEMENT_ALPHABET } = options;
    const base = name.trim().toLowerCase();

    if (position === 'suffix') {
      // e.g. "my-el" → "my-el_kmpqrsab"; "app" → "app-_kmpqrsab"
      const prefix = base.includes('-') ? base : `${base}-`;
      return getId(CUSTOM_ELEMENTS_SCOPE, { alphabet, prefix });
    }

    // prefix: unique code first (hashID leading `_` stripped so the tag starts with a-z), then name
    const unique = getId(CUSTOM_ELEMENTS_SCOPE, { alphabet });
    const randomPart = unique.startsWith('_') ? unique.slice(1) : unique;
    const fullName = `${randomPart}-${base}`;

    // Track the composed tag name instead of the intermediate token
    removeId(CUSTOM_ELEMENTS_SCOPE, unique);
    if (!cacheIds.has(CUSTOM_ELEMENTS_SCOPE)) {
      cacheIds.set(CUSTOM_ELEMENTS_SCOPE, new Set());
    }
    cacheIds.get(CUSTOM_ELEMENTS_SCOPE)!.add(fullName);

    return fullName;
  }

  /**
   * Removes an ID from a given scope.
   *
   * @param scopeName - The symbol representing the scope from which to remove the ID.
   * @param id - The ID to remove.
   */
  function removeId(scopeName: symbol, id: string): void {
    if (cacheIds.has(scopeName)) {
      const ids = cacheIds.get(scopeName) as Set<string>;
      ids.delete(id);

      if (ids.size === 0) {
        cacheIds.delete(scopeName);
      }
    }
  }

  /**
   * Checks if an ID exists within a given scope.
   *
   * @param scopeName - The symbol representing the scope to check.
   * @param id - The ID to check for existence.
   * @returns `true` if the ID exists in the scope, `false` otherwise.
   */
  function has(scopeName: symbol, id: string): boolean {
    let result = false;

    if (cacheIds.has(scopeName)) {
      const ids = cacheIds.get(scopeName) as Set<string>;
      result = ids.has(id);
    }

    return result;
  }

  return Object.freeze({
    getId,
    getCustomElementName,
    removeId,
    has,
  });
}
