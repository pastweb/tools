export function getDeviceName(deviceName: string): string {
  return `is${deviceName.charAt(0).toUpperCase()}${deviceName.slice(1)}`
    .replace(/ [A-Z_a-z]/g, match => match.replace(match, match.charAt(match.length - 1).toUpperCase()));
}
