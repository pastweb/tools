import { isObject } from '../isObject';
import { REACTIVE } from './constants';

export function isReactive(target: any): boolean {
  if (!isObject(target)) return false;
  return Object.hasOwn(target, REACTIVE);
}
