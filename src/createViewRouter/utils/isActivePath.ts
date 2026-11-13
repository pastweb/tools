/**
 * Returns whether `pathname` is the link path or a nested path under it.
 *
 * A match must end at a segment boundary, so sibling paths that only share a
 * string prefix (for example `/dropdown` and `/dropdownmenu`) are not active.
 *
 * @example
 * ```ts
 * isActivePath('/dropdown', '/dropdownmenu');
 * // false
 *
 * isActivePath('/blog', '/blog/post');
 * // true
 * ```
 */
export function isActivePath(
  linkPath: string,
  pathname: string,
  options: { sensitive?: boolean } = {},
): boolean {
  const { sensitive = false } = options;
  const link = normalizePathname(linkPath);
  const current = normalizePathname(pathname);
  const a = sensitive ? link : link.toLowerCase();
  const b = sensitive ? current : current.toLowerCase();

  if (a === '/') return true;

  return b === a || b.startsWith(`${a}/`);
}

function normalizePathname(path: string): string {
  const pathnameOnly = path.split('?')[0].split('#')[0];

  if (pathnameOnly === '/' || pathnameOnly === '') return '/';

  return pathnameOnly.replace(/\/+$/, '');
}
