/**
 * get target Type.
 * @param target
 * @returns {string}
 */
export function getType(target: any): string {
  return Object.prototype.toString.call(target).slice(8, -1);
}
