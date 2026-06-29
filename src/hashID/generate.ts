import { ALPHABET, ID_LENGTH } from './constants';
import type { HashIDOptions } from './types';

/**
 * Internal generator that produces a random "friendly" ID string.
 *
 * The ID always starts with an underscore (`_`) followed by `idLength-1`
 * random characters from the provided alphabet. A prefix can be prepended.
 *
 * **This function does not perform any uniqueness checks.**
 * Uniqueness (when needed) is handled by the public `hashID` wrapper.
 *
 * @param options - Generation options.
 * @param options.alphabet - Character pool to sample from.
 * @param options.prefix - Optional prefix.
 * @param options.idLength - Total length of the random part (including the leading `_`).
 * @returns A generated ID string (e.g. `"_a3f9k2p7"` or `"user-_x7k9p2"`).
 *
 * @internal
 */
export function generate({ alphabet = ALPHABET, prefix = '', idLength = ID_LENGTH }: HashIDOptions): string {
  let key = '_';

  for (let i = 0; i < (idLength - 1); i++) {
    key = `${key}${alphabet.charAt(
      Math.floor(Math.random() * alphabet.length)
    )}`;
  }

  return `${prefix}${key}`;
}
