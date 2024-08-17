/**
 * Converts a camelCase or PascalCase string into a kebab-case string.
 *
 * This function takes an input string, splits it into individual characters,
 * and then checks if each character is an uppercase letter. If it is, and it's
 * not the first character, it adds a hyphen (`-`) before the lowercase version
 * of the character. If the character is lowercase, it is appended to the result
 * without modification.
 *
 * @param {string} str - The input string to convert to kebab-case.
 * @returns {string} - The converted kebab-case string.
 *
 * @example
 * // Converts a camelCase string to kebab-case
 * kebabize('myVariableName');
 * // Returns 'my-variable-name'
 *
 * @example
 * // Converts a PascalCase string to kebab-case
 * kebabize('MyVariableName');
 * // Returns 'my-variable-name'
 */
export function kebabize(str: string): string {
  return str.split('').map((letter, idx) => {
    if (letter === '-') return letter;
    
    if (!isNaN(parseFloat(letter))) return letter;

    return letter.toUpperCase() === letter
     ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
     : letter;
  }).join('');
}
