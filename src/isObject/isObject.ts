import { isType } from '../isType';

/**
 * Simple object check.
 * @param target
 * @returns {boolean}
 */

export function isObject(target: any): boolean {
  return isType('Object', target);
}
