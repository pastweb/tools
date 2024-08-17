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
 * @returns `true` if the date is younger than the specified duration, `false` otherwise.
 */
export function isDateYoungerOf(date: Date, duration: string): boolean {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const regex = /(\d+Y)?(\d+M)?(\d+D)?(\d+h)?(\d+m)?(\d+s)?/;
  const matches = duration.match(regex);

  if (!matches) return false;

  // Extract and parse each component
  const years = matches[1] ? parseInt(matches[1].replace('Y', '')) : 0;
  const months = matches[2] ? parseInt(matches[2].replace('M', '')) : 0;
  const days = matches[3] ? parseInt(matches[3].replace('D', '')) : 0;
  const hours = matches[4] ? parseInt(matches[4].replace('h', '')) : 0;
  const minutes = matches[5] ? parseInt(matches[5].replace('m', '')) : 0;
  const seconds = matches[6] ? parseInt(matches[6].replace('s', '')) : 0;

  let result = false;

  if (years) {
    const diff = now.getFullYear() - date.getFullYear();
    result = Math.abs(diff) < years;
  } else {
    const diff = now.getFullYear() - date.getFullYear();
    result = diff > 0;
  }

  if (!result) {
    if (months) {
      const diff = now.getMonth() - date.getMonth();
      result = Math.abs(diff) < months;
    } else {
      const diff = now.getMonth() - date.getMonth();
      result = diff > 0;
    }
  }

  if (!result) {
    if (days) {
      const diff = now.getDate() - date.getDate();
      result = Math.abs(diff) < days;
    } else {
      const diff = now.getDate() - date.getDate();
      result = diff > 0;
    }
  }

  if (!result) {
    if (hours) {
      const diff = now.getHours() - date.getHours();
      result = diff < hours;
    } else {
      const diff = now.getHours() - date.getHours();
      result = diff > 0;
    }
  }

  if (!result) {
    if (minutes) {
      const diff = now.getMinutes() - date.getMinutes();
      result = Math.abs(diff) < minutes;
    } else {
      const diff = now.getMinutes() - date.getMinutes();
      result = diff > 0;
    }
  }
  
  if (!result && seconds) {
    const diff = now.getSeconds() - date.getSeconds();
    result = Math.abs(diff) < seconds;
  }    

  return result;
}
