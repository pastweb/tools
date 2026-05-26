import { isObject } from '../isObject';
import { PORTAL_HANDLER } from './constants';
import type { PortalHandler } from './types';

export function setAsPortalHandler(target: Record<string | symbol, any>): PortalHandler | boolean {
  if (!isObject(target)) return false;

  Object.defineProperty(target, PORTAL_HANDLER, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  });

  return target as PortalHandler;
}
