import { ENTRY } from './constants';
import { isObject } from '../isObject';

export function isEntry(target: any): boolean {
  if (!isObject(target)) return false;
  return Object.hasOwn(target, ENTRY);
}
