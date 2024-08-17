import { Location } from '../types';

export function getLocation(href: string): Location {
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
  };
}
