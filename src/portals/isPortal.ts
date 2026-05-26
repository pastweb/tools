import { isObject } from '../isObject';
import { PORTAL } from './constants';

export function isPortal(target: any): boolean {
  if(!isObject(target)) return false;
  return Object.hasOwn(target, PORTAL);
}
