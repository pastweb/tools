export const cacheIds: Map<symbol, Set<string>> = new Map();

export const ELEMENTS_SCOPE = Symbol('$$Elements');
export const CUSTOM_ELEMENTS_SCOPE = Symbol('$$CustomElements');

/**
 * ASCII characters used when generating the unique segment of a custom element
 * name (lowercase letters only).
 *
 * Custom element tags must start with an ASCII lower alpha; using this alphabet
 * with {@link hashID} / {@link IdCache.getId} keeps the random segment in `a–z`.
 * The base name (and hyphen rules) are composed by
 * {@link IdCache.getCustomElementName}.
 *
 * @example
 * ```ts
 * import {
 *   CUSTOM_ELEMENT_ALPHABET,
 *   createIdCache,
 *   CUSTOM_ELEMENTS_SCOPE,
 * } from '@pastweb/tools';
 *
 * const idCache = createIdCache();
 * const tag = idCache.getCustomElementName('app-el', {
 *   alphabet: CUSTOM_ELEMENT_ALPHABET,
 * });
 * ```
 */
export const CUSTOM_ELEMENT_ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
