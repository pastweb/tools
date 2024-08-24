/**
 * @deprecated This function is deprecated and will be removed in future versions. 
 * Please use the `isDateYoungerOf` function instead.
 * 
 * Determines if the difference between the current time and a given time (in hours) 
 * is less than a specified number of hours.
 * 
 * @param hoursTime - The timestamp (in milliseconds) representing the time to compare against the current time.
 * @param then - The threshold number of hours to compare against.
 * 
 * @returns `true` if the difference in time is less than the specified number of hours (`then`); otherwise, `false`.
 * 
 * @example
 * ```typescript
 * const isRecent = isHoursTimeYoungerThen(Date.now() - 2 * 60 * 60 * 1000, 3); // true
 * const isOlder = isHoursTimeYoungerThen(Date.now() - 5 * 60 * 60 * 1000, 3); // false
 * ```
 */
export function isHoursTimeYoungerThen(hoursTime: number, then: number): boolean {
  console.warn('[WARNING]: "isHoursTimeYoungerThen" is deprecated use "isDateYoungerOf" instead - https://github.com/pastweb/tools?tab=readme-ov-file#isdateyoungerof');
  const now = new Date();
  const diff = Math.abs(now.getTime() - new Date(hoursTime).getTime());
  const seconds = parseFloat((diff / 1000).toFixed(0));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours < then) {
    return true;
  }
    
  return false;
}
