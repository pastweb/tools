import type { IncomingMessage as NodeRequest } from 'node:http';
import type { ServerRequest } from '../types';

/**
 * Normalizes a raw Node.js IncomingMessage (or compatible server request) into the internal ServerRequest format.
 *
 * This is used by `setRequest` for SSR initialization. It extracts URL, method, headers, IP, userAgent, cookies,
 * and derived fields like language, os, and colorScheme.
 *
 * @param req - The raw server request (typically http.IncomingMessage)
 * @returns A normalized ServerRequest object used by the router
 */
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

  const userAgent = headers.get('user-agent') || '';
  const cookies = headers.get('cookie') || '';

  return {
    // Web Standard Request
    url,
    method: req.method || 'GET',
    headers,
    // Extended ServerRequest properties
    originalRequest: req,
    ip: (req as any).ip || headers.get('x-forwarded-for') || headers.get('x-real-ip') || '',
    userAgent,
    cookies,
    language: getPrimaryLanguage(headers),
    os: detectOS(userAgent),
    colorScheme: getColorScheme(headers, cookies),
  };
}

/**
 * Extracts the primary language from Accept-Language header.
 */
function getPrimaryLanguage(headers: Headers): string {
  const accept = headers.get('accept-language') || '';
  if (!accept) return '';
  // Take the first language tag (highest q value comes first)
  const first = accept.split(',')[0].trim();
  return first.split(';')[0].trim();
}

/**
 * Very lightweight OS detection from User-Agent.
 * Returns the OS name, and version when it can be reliably extracted.
 * Examples: "macOS 10.15.7", "Windows 10", "iOS 17.2", "Android 14", "Linux"
 *
 * No external dependencies.
 */
function detectOS(ua: string): string {
  if (!ua) return 'Unknown';
  const u = ua.toLowerCase();

  // iOS (iPhone, iPad, iPod)
  const iosMatch = ua.match(/iP(?:hone|ad|od).*?OS (\d+)[_\.](\d+)?/i);
  if (iosMatch) {
    const major = iosMatch[1];
    const minor = iosMatch[2] || '0';
    return `iOS ${major}.${minor}`;
  }
  if (u.includes('iphone') || u.includes('ipad') || u.includes('ipod')) return 'iOS';

  // Android
  const androidMatch = ua.match(/Android (\d+)(?:\.(\d+))?/i);
  if (androidMatch) {
    const major = androidMatch[1];
    const minor = androidMatch[2];
    return minor ? `Android ${major}.${minor}` : `Android ${major}`;
  }
  if (u.includes('android')) return 'Android';

  // Windows
  const windowsMatch = ua.match(/Windows NT (\d+\.\d+)/i);
  if (windowsMatch) {
    const ntVersion = windowsMatch[1];
    const versionMap: Record<string, string> = {
      '10.0': 'Windows 10/11',
      '6.3': 'Windows 8.1',
      '6.2': 'Windows 8',
      '6.1': 'Windows 7',
      '6.0': 'Windows Vista',
      '5.1': 'Windows XP',
    };
    return versionMap[ntVersion] || `Windows NT ${ntVersion}`;
  }
  if (u.includes('windows nt') || u.includes('windows phone')) return 'Windows';

  // macOS
  const macMatch = ua.match(/Mac OS X (\d+)[_\.](\d+)(?:[_\.](\d+))?/i) ||
                   ua.match(/Macintosh.*Mac OS X (\d+)[_\.](\d+)/i);
  if (macMatch) {
    const major = macMatch[1];
    const minor = macMatch[2];
    const patch = macMatch[3] ? `.${macMatch[3]}` : '';
    // Convert 10_15_7 style to 10.15.7
    return `macOS ${major}.${minor}${patch}`;
  }
  if (u.includes('mac os') || u.includes('macintosh')) return 'macOS';

  // Chrome OS
  if (u.includes('cros')) {
    const crosMatch = ua.match(/CrOS[^;]+ (\d+\.\d+\.\d+)/i);
    if (crosMatch) {
      return `Chrome OS ${crosMatch[1]}`;
    }
    return 'Chrome OS';
  }

  // Linux / BSD distros
  if (u.includes('ubuntu')) return 'Ubuntu';
  if (u.includes('debian')) return 'Debian';
  if (u.includes('linux') || u.includes('x11')) return 'Linux';
  if (u.includes('freebsd')) return 'FreeBSD';
  if (u.includes('openbsd')) return 'OpenBSD';

  return 'Unknown';
}

/**
 * Detects preferred color scheme.
 * Priority:
 * 1. Sec-CH-Prefers-Color-Scheme client hint (modern, when enabled)
 * 2. Common cookie patterns (many apps store the choice server-side)
 */
function getColorScheme(headers: Headers, cookies: string): 'light' | 'dark' | 'no-preference' {
  // Modern client hint (best source when available)
  const hint = headers.get('sec-ch-prefers-color-scheme');
  if (hint === 'dark' || hint === 'light') {
    return hint;
  }

  // Fallback to cookies (very common pattern)
  if (cookies) {
    const match = cookies.match(/(?:^|;\s*)(?:prefers-color-scheme|theme|color-scheme|dark-mode)=([^;]+)/i);
    if (match) {
      const val = decodeURIComponent(match[1]).toLowerCase().trim();
      if (val === 'dark' || val.includes('dark')) return 'dark';
      if (val === 'light' || val.includes('light')) return 'light';
    }
  }

  return 'no-preference';
}
