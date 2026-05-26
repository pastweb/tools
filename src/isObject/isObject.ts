import { isType } from '../isType';

/**
 * Simple object check.
 * @param target
 * @returns {boolean}
 */

export function isObject(target: any): boolean {
  if (typeof target !== 'object') return false;
  return isType('Object', target);
}
