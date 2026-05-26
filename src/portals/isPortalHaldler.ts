import { isObject } from '../isObject';
import { PORTAL_HANDLER } from './constants';

export function isPortalHandler(target: any): boolean {
  if (!isObject(target)) return false;
  return Object.hasOwn(target, PORTAL_HANDLER);
}
