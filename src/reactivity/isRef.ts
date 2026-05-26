import { isObject } from '../isObject';
import { REF } from './constants';

export function isRef(target: any): boolean {
  if (!isObject(target)) return false;
  return Object.hasOwn(target, REF);
}
