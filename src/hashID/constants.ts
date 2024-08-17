/**
 * The default alphabet is 62 numbers and lower and uppe case letters and numbers.
 * Any numbers that look like letters and vice versa are removed:
 * 1 l, 0 o.
 * Also the following letters are not present, to prevent any
 * expletives: cfhistu
 */
export const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Governs the length of the ID.
// With an alphabet of 62 chars,
// a length of 8 gives us 62^8 or
// 218,340,105,584,896 possibilities.
// Should be enough...
export const ID_LENGTH = 8;

/**
 * Governs the number of times we should try to find
 * a unique value before giving up.
 * @type {Number}
 */
export const UNIQUE_RETRIES: number = 9999;
