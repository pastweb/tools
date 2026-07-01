/**
 * Checks if a given date is younger than a specified duration.
 * 
 * @param date - The date to be checked.
 * @param duration - A string representing the duration composed of numbers and letters:
 *                   - "Y" for years
 *                   - "M" for months
 *                   - "D" for days
 *                   - "h" for hours
 *                   - "m" for minutes
 *                   - "s" for seconds
 *                   The string can contain multiple components, e.g., "2Y3M1D" for 2 years, 3 months, and 1 day.
 * @returns `true` if the date is strictly younger than the specified duration, `false` otherwise.
 */
export function isDateYoungerOf(date: Date, duration: string): boolean {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false;
  if (typeof duration !== 'string' || !duration.trim()) return false;

  const normalized = duration.replace(/(\d+)H/g, '$1h');
  const regex = /(\d+)Y|(\d+)M|(\d+)D|(\d+)h|(\d+)m|(\d+)s/g;
  const cutoff = new Date();
  let matched = false;
  let hasPositiveDuration = false;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(normalized)) !== null) {
    matched = true;

    if (match[1]) {
      const value = parseInt(match[1], 10);
      hasPositiveDuration ||= value > 0;
      cutoff.setFullYear(cutoff.getFullYear() - value);
    }
    if (match[2]) {
      const value = parseInt(match[2], 10);
      hasPositiveDuration ||= value > 0;
      cutoff.setMonth(cutoff.getMonth() - value);
    }
    if (match[3]) {
      const value = parseInt(match[3], 10);
      hasPositiveDuration ||= value > 0;
      cutoff.setDate(cutoff.getDate() - value);
    }
    if (match[4]) {
      const value = parseInt(match[4], 10);
      hasPositiveDuration ||= value > 0;
      cutoff.setHours(cutoff.getHours() - value);
    }
    if (match[5]) {
      const value = parseInt(match[5], 10);
      hasPositiveDuration ||= value > 0;
      cutoff.setMinutes(cutoff.getMinutes() - value);
    }
    if (match[6]) {
      const value = parseInt(match[6], 10);
      hasPositiveDuration ||= value > 0;
      cutoff.setSeconds(cutoff.getSeconds() - value);
    }
  }

  return matched && hasPositiveDuration && date.getTime() > cutoff.getTime();
}
