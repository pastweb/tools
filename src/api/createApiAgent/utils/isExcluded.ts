import type { AgentSettings } from '../types';

/**
 * Checks if a URL is excluded from request interception.
 *
 * @param url - The URL to check.
 * @returns Whether the URL is excluded.
 */
export function isExcluded(settings: AgentSettings, url?: string): boolean {
  if (!url) return false;

  const { exclude: _exclude } = settings.options;
  const exclude = !_exclude ? [] : Array.isArray(_exclude) ? _exclude : [_exclude];

  for (const rule of exclude) {
    if (typeof rule === 'string' && rule === url) return true;
    if (rule instanceof RegExp && rule.test(url)) return true;
  }

  return false;
}
