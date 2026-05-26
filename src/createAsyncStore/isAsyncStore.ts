import { isObject } from '../isObject';
import { ASYNC_STORE } from './constants';

export function isAsyncStore(target: any): boolean {
  if (!isObject(target)) return false;
  return Object.hasOwn(target, ASYNC_STORE);
}
