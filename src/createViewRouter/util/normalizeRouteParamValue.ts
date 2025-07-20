import type { RouteParamValue } from '../types';

export function normalizeRouteParamValue(value: string): RouteParamValue {
  let val: RouteParamValue = value;

  if (value === 'undefined') val = undefined;
  else if (value === 'null') val = null;
  else if (/(^true$|^false$)/i.test(value)) val = /^true$/i.test(value);
  else if (!isNaN(+value)) val = parseFloat(value);

  return val;
}
