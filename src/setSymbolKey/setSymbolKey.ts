import { DEFAULT_SYMBOL_DESCRIPTOR } from './constants';
import type { Descriptor } from './types';

export function setSymbolKey(
  target: Record<PropertyKey, any>,
  symbol: symbol, value: any = true,
  descriptor: Descriptor = DEFAULT_SYMBOL_DESCRIPTOR,
): void {
  Object.defineProperty(target, symbol, {
    ...descriptor,
    value,
  });
}
