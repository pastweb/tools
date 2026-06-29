import { normalizeRouteParamValue } from './normalizeRouteParamValue';
import type { RouteParams } from '../types';

/**
 * Matches a pathname against a compiled regexp and extracts route parameters.
 * 
 * Supports:
 * - Named parameters: `:paramName` → `params.paramName` (string)
 * - Catch-all parameters: `*slug` → `params.slug` (string array)
 * 
 * All values are automatically decoded with `decodeURIComponent` and normalized.
 * 
 * @param path - The original route definition (e.g. "/comments/*slug")
 * @param regexp - The compiled RegExp from `pathToRegExp`
 * @param pathname - The pathname to match (e.g. "/comments/my-topic/1")
 * @returns RouteParams object or `false` if no match
 */
export function pathMatch(path: string, regexp: RegExp, pathname: string): RouteParams | false {
  const match = regexp.exec(pathname);
  if (!match) return false;

  const params: RouteParams = {};

  let captureIndex = 1;

  // 1. Named parameters (:paramName)
  const namedParamRegex = /:(\w+)/g;
  const namedParamNames = [...path.matchAll(namedParamRegex)].map(m => m[1]);

  namedParamNames.forEach((name) => {
    const value = match[captureIndex];
    if (value !== undefined) {
      params[name] = normalizeRouteParamValue(decodeURIComponent(value));
    }
    captureIndex++;
  });

  // 2. Catch-all parameters (*slug)
  const catchAllRegex = /\*(\w*)/g;
  const catchAllNames = [...path.matchAll(catchAllRegex)].map(m => m[1] || 'slug');

  catchAllNames.forEach((name) => {
    const value = match[captureIndex];
    if (value) {
      params[name] = value
        .split('/')
        .filter(Boolean)
        .map(decodeURIComponent)
        .map(normalizeRouteParamValue);
    } else {
      params[name] = [];
    }
    captureIndex++;
  });

  return params;
}
