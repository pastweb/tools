/**
 * Appends a comma-separated header value only when it is not already present.
 */
export function appendHeaderValue(currentValue: string | null | undefined, nextValue: string): string {
  if (!currentValue) return nextValue;

  const values = currentValue
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(Boolean);

  if (values.includes(nextValue.toLowerCase())) return currentValue;

  return `${currentValue}, ${nextValue}`;
}
