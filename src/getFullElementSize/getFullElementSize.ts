import { isSSR } from '../isSSR';
import { ATTRIBS, EMPTY } from './constants';
import type { Attribute, FullElementSize } from './types';

/**
 * Calculates the full size of an HTML element including padding, border, and margin, with the option to exclude certain attributes.
 *
 * @param element - The HTML element whose size is to be calculated. If the element is null or undefined, an empty size object is returned.
 * @param exclude - An optional array of attribute names to exclude from the size calculation. Defaults to an empty array.
 * @returns The full size of the element including padding, border, and margin, as an object with width and height properties.
 *
 * @example
 * ```typescript
 * import { getFullElementSize } from './getFullElementSize';
 * 
 * const element = document.getElementById('myElement');
 * const size = getFullElementSize(element);
 * console.log(size.width, size.height);
 * ```
 */
export function getFullElementSize(
  element: HTMLElement | null | undefined,
  exclude: Attribute[] = []
): FullElementSize {
  if (!element) return EMPTY;
  if (isSSR) return EMPTY;

  const _exclude = new Set(exclude);
  const cs = window.getComputedStyle(element);
  const sizes: FullElementSize = { ...EMPTY };

  Object.entries(ATTRIBS).forEach(([dim, attrs]) => {
    (sizes as any)[dim] = attrs
      .map((attr) => !_exclude.has(attr) ? parseFloat((cs as any)[attr]) || 0 : 0)
      .reduce((acc, curr) => acc + curr);
  });

  return sizes;
}
