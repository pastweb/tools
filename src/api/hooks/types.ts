/**
 * Controls whether a failed query/mutation should be retried.
 *
 * - `false` or omitted: do not retry.
 * - `true`: retry up to 3 times.
 * - `number`: retry up to that many times after the first failed attempt.
 * - function: called with the 1-based failure count and the error; return `true` to retry.
 */
export type RetryOption = boolean | number | ((failureCount: number, error: unknown) => boolean);

/**
 * Delay before the next retry attempt.
 *
 * - `number`: milliseconds.
 * - `string`: duration string parsed by `stringToMs` (for example `'250ms'`, `'1s'`, `'2m'`).
 * - function: called with the 1-based failure count and the error; return milliseconds.
 */
export type RetryDelayOption = number | string | ((failureCount: number, error: unknown) => number);
