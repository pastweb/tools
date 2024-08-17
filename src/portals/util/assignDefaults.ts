import { deepMerge } from '../../deepMerge';

export function assignDefaults(data: Record<string, any>, defaults: Record<string, any>) {
  if (!Object.keys(defaults).length) return data;
  
  return deepMerge(defaults, data);
}
