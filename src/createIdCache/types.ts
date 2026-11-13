import type { HashIDOptions } from '../hashID';

export type { HashIDOptions } from '../hashID';

/**
 * Where the unique random segment is placed relative to the base `name`
 * in {@link IdCache.getCustomElementName}.
 *
 * - `suffix` — `name` first, then random (e.g. `my-el_k2m9p1q0`)
 * - `prefix` — random first, then `name` (e.g. `k2m9p1q0-my-el`)
 */
export type CustomElementNamePosition = 'prefix' | 'suffix';

/**
 * Options for {@link IdCache.getCustomElementName}.
 */
export type GetCustomElementNameOptions = {
  /**
   * Place the unique segment before (`prefix`) or after (`suffix`) `name`.
   * @default 'suffix'
   */
  position?: CustomElementNamePosition;
  /**
   * Character pool for the unique segment (forwarded to {@link hashID}).
   * @default {@link CUSTOM_ELEMENT_ALPHABET}
   */
  alphabet?: string;
};

/**
 * Scoped unique-ID cache returned by {@link createIdCache}.
 */
export interface IdCache {
  /**
   * Generates and stores a unique ID for `scopeName`.
   *
   * @param scopeName - Scope key for the ID set.
   * @param options - Options forwarded to {@link hashID} (`prefix`, `idLength`, `alphabet`, `retries`, …).
   */
  getId: (scopeName: symbol, options?: HashIDOptions) => string;
  /**
   * Builds a unique custom element tag name from a base `name`.
   *
   * Uses {@link getId} with {@link CUSTOM_ELEMENTS_SCOPE} and the given
   * (or default) alphabet so uniqueness is handled by the same path as
   * normal IDs.
   *
   * @param name - Base tag segment (lowercased). A hyphen is ensured when missing.
   * @param options - `position` (`suffix` by default) and optional `alphabet`.
   */
  getCustomElementName: (
    name: string,
    options?: GetCustomElementNameOptions,
  ) => string;
  /** Removes an ID from a scope (and drops empty scopes). */
  removeId: (scopeName: symbol, id: string) => void;
  /** Whether an ID exists in a scope. */
  has: (scopeName: symbol, id: string) => boolean;
}
