/**
 * Converts a string to camel case, cutting the string by multiple separators 
 * like hyphens, underscores, and spaces.
 * 
 * @param {string} text - The text to camelize.
 * @returns {string} - The camelized text.
 */
export function camelize(text: string): string {
  return text.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2, offset) => {
    return p2 ? p2.toUpperCase() : p1.toLowerCase();
  });
}
