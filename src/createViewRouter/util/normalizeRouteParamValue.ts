import type { RouteParamValue } from '../types';

/**
 * Normalizes a route parameter value from string to its appropriate type.
 * 
 * Converts:
 * - "true" / "false" → boolean
 * - numeric strings → number
 * - "null" → null
 * - "undefined" → undefined
 * - otherwise → original string
 * 
 * @param value - The raw string value from the URL
 * @returns The normalized value with correct type
 */
export function normalizeRouteParamValue(value: string): RouteParamValue {
  if (value === 'undefined') return undefined;
  if (value === 'null') return null;
  
  if (/^true$/i.test(value)) return true;
  if (/^false$/i.test(value)) return false;
  
  const num = Number(value);
  
  if (!isNaN(num) && value.trim() !== '') return num;

  return value; // fallback to string
}
