import { generate } from './generate';
import { UNIQUE_RETRIES } from './constants';
import type { Config } from './types';

/**
 * If the cache is Provided tries to generate a unique ID that is not defined in the
 * `cache` array. I will returns a random id if not any cache is provided.
 * @param  {Array} cache The list of previous ids to avoid.
 * @param  {Object} [config] The Config Object.
 * @return {String} A unique ID, or `null` if one could not be generated.
 */
export function hashID(cache?: string[] | Set<string> | null, config: Config = {}): string {
  if (!cache) {
    return generate(config);
  }

  const { retries = UNIQUE_RETRIES } = config;
  const cacheSet = new Set(cache) || new Set();
  let id = '';
  
  // Try to generate a unique ID,
  // i.e. one that isn't in the cache.

  for (let i = 0; i < retries; i++) {
    id = generate(config);

    if (!cacheSet.has(id)) break;

    if (i === retries) {
      console.error(`tried ${i} times to find a unique ID.`);
    }
  }

  return id;
}
