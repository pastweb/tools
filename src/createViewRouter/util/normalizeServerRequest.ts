import type { IncomingMessage as NodeRequest } from 'node:http';
import type { ServerRequest } from '../types';

export function normalizeServerRequest(req: NodeRequest): ServerRequest {
  let url;
  try {
    url = req.url?.startsWith('http') 
      ? new URL(req.url) 
      : new URL(req.url || '/', 'http://localhost');
  } catch {
    url = new URL('/', 'http://localhost');
  }

  const headers = new Headers();

  if (!req.headers.get && req.rawHeaders) {
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      headers.append(req.rawHeaders[i], req.rawHeaders[i + 1]);
    }
  } else if (req.headers) {
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        value.forEach(v => headers.append(key, v));
      } else if (value !== undefined) {
        headers.append(key, value);
      }
    }
  }

  return {
    // Web Standard Request
    url,
    method: req.method || 'GET',
    headers,
    // Extended ServerRequest properties
    originalRequest: req,
    ip: (req as any).ip || headers.get('x-forwarded-for') || headers.get('x-real-ip') || '',
    userAgent: headers.get('user-agent') || '',
    cookies: headers.get('cookie') || '',
  };
}
