/**
 * Converts a camelCase, PascalCase, or spaced phrase into a kebab-case string.
 *
 * Uppercase letters become a hyphen plus the lowercase letter (except at the
 * start). Whitespace becomes a hyphen. Consecutive hyphens collapse to one,
 * and leading or trailing hyphens are omitted. Existing hyphens and digits
 * are preserved.
 *
 * @param str - The input string to convert to kebab-case.
 * @returns The kebab-case string.
 *
 * @example
 * ```ts
 * import { kebabize } from '@pastweb/tools';
 *
 * kebabize('myVariableName');
 * // 'my-variable-name'
 *
 * kebabize('Select an option');
 * // 'select-an-option'
 * ```
 */
export function kebabize(str: string): string {
  return str
    .split('')
    .map((letter, idx) => {
      if (/\s/.test(letter)) return '-';
      if (letter === '-') return letter;
      if (!isNaN(parseFloat(letter))) return letter;

      return letter.toUpperCase() === letter
        ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
        : letter;
    })
    .join('')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
