/**
 * Converts a duration string to milliseconds.
 *
 * Uses the same unit format as {@link isDateYoungerOf}:
 * - `Y` — years (average: 365.25 days)
 * - `M` — months (average: 30.436875 days)
 * - `D` — days
 * - `h` — hours (case-insensitive)
 * - `m` — minutes
 * - `s` — seconds
 *
 * Components can be combined in any order, e.g. `"2Y3M1D2h30m45s"`, `"5m"`, `"1D1s"`.
 * Returns `0` for empty, whitespace-only, or unparseable strings.
 *
 * @param duration - Duration string such as `"2Y3M1D2h30m45s"`, `"1Y"`, `"5D2h"`, or `"30m"`.
 * @returns The duration expressed in milliseconds (floored to an integer).
 *
 * @example
 * stringToMs('1s');              // 1000
 * stringToMs('5m');              // 300000
 * stringToMs('1D');              // 86400000
 * stringToMs('2Y3M1D2h30m45s');  // combined total in ms
 * stringToMs('');                // 0
 */
export function stringToMs(duration: string): number {
  if (typeof duration !== 'string' || !duration.trim()) {
    return 0;
  }

  // Normalize uppercase hours before parsing so M (months) and m (minutes) stay distinct.
  const normalized = duration.replace(/(\d+)H/g, '$1h');
  const regex = /(\d+)Y|(\d+)M|(\d+)D|(\d+)h|(\d+)m|(\d+)s/g;
  let totalMs = 0;

  let match: RegExpExecArray | null;

  // Standard approximations
  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = 60 * MS_PER_SECOND;
  const MS_PER_HOUR   = 60 * MS_PER_MINUTE;
  const MS_PER_DAY    = 24 * MS_PER_HOUR;
  const MS_PER_MONTH  = 30.436875 * MS_PER_DAY;   // Average month (365.25/12 days)
  const MS_PER_YEAR   = 365.25 * MS_PER_DAY;      // Average year

  while ((match = regex.exec(normalized)) !== null) {
    if (match[1]) totalMs += parseInt(match[1]) * MS_PER_YEAR;     // Y
    if (match[2]) totalMs += parseInt(match[2]) * MS_PER_MONTH;    // M
    if (match[3]) totalMs += parseInt(match[3]) * MS_PER_DAY;      // D
    if (match[4]) totalMs += parseInt(match[4]) * MS_PER_HOUR;     // h
    if (match[5]) totalMs += parseInt(match[5]) * MS_PER_MINUTE;   // m
    if (match[6]) totalMs += parseInt(match[6]) * MS_PER_SECOND;   // s
  }

  return Math.floor(totalMs);
}
