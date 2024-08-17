import { getType } from '../getType';

/**
 * Type check.
 * @param target
 * @returns {boolean}
 */
export function isType(type: string, target: any): boolean {
  return target !== undefined && target !== null && getType(target) === type;
}
