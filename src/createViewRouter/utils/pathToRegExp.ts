/**
 * Converts a route path string into a RegExp with support for:
 * 
 * - `:paramName`          → Required named parameter
 * - `?:paramName` or `:paramName?` → Optional named parameter (slash before it is also optional)
 * - `*slug`               → Catch-all (one or more segments) → becomes array in params
 * - `*?slug` or `*slug?`  → Optional catch-all (zero or more segments)
 * 
 * @param path - The route path (e.g. "/blog/:category/*slug")
 * @param options - Configuration options
 * @param options.end - Whether to match the end of the string (default: true)
 * @param options.start - Whether to match from the start of the string (default: true)
 * @param options.sensitive - Case sensitive matching (default: false)
 * @returns A RegExp that can be used to match against a pathname
 */
export function pathToRegExp(
  path: string, 
  options: { 
    end?: boolean; 
    start?: boolean; 
    sensitive?: boolean 
  } = {}
): RegExp {
  const { 
    end = true, 
    start = true, 
    sensitive = false 
  } = options;

  let pattern = path
    // === OPTIONAL NAMED PARAMETER (with optional preceding slash) ===
    // /?:id or /:id? → (?:/([^/]+))?
    .replace(/\/\?:(\w+)/g, '(?:/([^/]+))?')
    .replace(/\/:(\w+)\?/g, '(?:/([^/]+))?')
    
    // === REQUIRED NAMED PARAMETER ===
    .replace(/\/:(\w+)/g, '/([^/]+)')
    
    // === OPTIONAL CATCH-ALL ===
    .replace(/\/\?*\*(\w*)/g, '(?:/(.*))?')
    
    // === STANDARD CATCH-ALL ===
    .replace(/\/\*/g, '/(.*)');

  // Add anchors
  if (start) pattern = '^' + pattern;
  if (end) pattern += '$';

  const flags = sensitive ? '' : 'i';
  return new RegExp(pattern, flags);
}
