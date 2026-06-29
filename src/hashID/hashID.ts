import { generate } from './generate';
import { UNIQUE_RETRIES } from './constants';
import type { HashIDOptions } from './types';

/**
 * Generates a random "friendly" ID.
 *
 * If a `cache` is provided, it will attempt to generate a unique ID that is not
 * present in the cache (using a `Set` for fast lookups). It will retry up to
 * `retries` times (default: 9999).
 *
 * If no cache is provided, it simply returns a randomly generated ID without
 * uniqueness guarantees (uniqueness is your responsibility).
 *
 * @param cache - An optional array or Set of existing IDs to avoid. If omitted or null/undefined,
 *                a random ID is returned immediately.
 * @param option - Configuration options.
 * @param option.alphabet - The character set to use when generating IDs. Defaults to a 62-character
 *                          alphanumeric set (with visually ambiguous characters like `0`/`O` and `1`/`l` removed,
 *                          plus some letters excluded to reduce profanity risk).
 * @param option.prefix - An optional prefix to prepend to every generated ID.
 * @param option.idLength - The length of the generated ID (excluding prefix). Default is 8.
 * @param option.retries - Maximum number of attempts when a `cache` is provided. Default is 9999.
 * @returns A generated ID string. When a cache is provided and no unique ID could be found after
 *          all retries, the last generated (possibly colliding) ID is returned and a console error is logged.
 *
 * @example
 * // Simple random ID (no uniqueness check)
 * hashID(); // e.g. "_a3f9k2p7"
 *
 * @example
 * // Unique ID with cache
 * const used = new Set(['_abc12345']);
 * const id = hashID(used, { prefix: 'user-', retries: 10 });
 *
 * @see createIdCache for a more advanced scoped ID cache with namespacing.
 */
export function hashID(cache?: string[] | Set<string> | null, option: HashIDOptions = {}): string {
  if (!cache) {
    return generate(option);
  }

  const { retries = UNIQUE_RETRIES } = option;
  const cacheSet = new Set(cache) || new Set();
  let id = '';
  
  // Try to generate a unique ID,
  // i.e. one that isn't in the cache.

  for (let i = 0; i < retries; i++) {
    id = generate(option);

    if (!cacheSet.has(id)) break;

    if (i === retries) {
      console.error(`tried ${i} times to find a unique ID.`);
    }
  }

  return id;
}
