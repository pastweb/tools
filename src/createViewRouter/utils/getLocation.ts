import type { Location } from '../types';

/**
 * Parses a URL href string (and optional userAgent) into a structured Location object.
 *
 * This is used internally by the router to normalize browser or server locations.
 *
 * @param href - The full URL string (e.g. "https://example.com/path?query=1#hash")
 * @param userAgent - Optional user agent string (defaults to empty in SSR)
 * @returns A normalized Location object with pathname, searchParams, hash, etc.
 */
export function getLocation(href: string, userAgent: string): Location {
  const originMatch = href.match(/^(.*:\/\/)?[^\/]+(:[\d]+)?/);
  const origin = originMatch ? originMatch[0] : '';

  const protocol = origin.includes('://') ? origin.substring(0, origin.indexOf('://')) : '';
  const host = origin.replace(`${protocol}://`, '');
  const [ hostname = '', port = '' ] = host.split(':');
  
  let route = `/${href.replace(origin, '').replace('/', '')}`;

  const hash = route.includes('#') ? route.split('#')[1] : '';

  route = route.replace(/#.*$/, '');

  const [ pathname, searchParams = '' ] = route.split('?');
  

  return {
    hash,
    href,
    protocol,
    host,
    hostname,
    port: parseInt(port) || 80,
    origin,
    pathname,
    searchParams: new URLSearchParams(searchParams),
    userAgent,
  };
}
