import { describe, it, expect } from 'vitest';
import { stringToMs } from '../../src/stringToMs';

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MS_PER_MONTH = 30.436875 * MS_PER_DAY;
const MS_PER_YEAR = 365.25 * MS_PER_DAY;

describe('given the stringToMs function', () => {
  it('given single-unit durations 1s/1m/1h/1D/1M/1Y, when stringToMs, then returns the expected millisecond values', () => {
    expect(stringToMs('1s')).toBe(MS_PER_SECOND);
    expect(stringToMs('1m')).toBe(MS_PER_MINUTE);
    expect(stringToMs('1h')).toBe(MS_PER_HOUR);
    expect(stringToMs('1D')).toBe(MS_PER_DAY);
    expect(stringToMs('1M')).toBe(Math.floor(MS_PER_MONTH));
    expect(stringToMs('1Y')).toBe(Math.floor(MS_PER_YEAR));
  });

  it('given combined duration "2Y3M1D2h30m45s", when stringToMs, then returns the sum of all components', () => {
    const expected = Math.floor(
      2 * MS_PER_YEAR +
      3 * MS_PER_MONTH +
      1 * MS_PER_DAY +
      2 * MS_PER_HOUR +
      30 * MS_PER_MINUTE +
      45 * MS_PER_SECOND
    );

    expect(stringToMs('2Y3M1D2h30m45s')).toBe(expected);
  });

  it('given common cache-style durations "5m" and "1s", when stringToMs, then returns 5 minutes and 1 second in ms', () => {
    expect(stringToMs('5m')).toBe(5 * MS_PER_MINUTE);
    expect(stringToMs('1s')).toBe(MS_PER_SECOND);
  });

  it('given repeated hour components "1h1h", when stringToMs, then sums both occurrences', () => {
    expect(stringToMs('1h1h')).toBe(2 * MS_PER_HOUR);
  });

  it('given uppercase hours "1H" and mixed "2H15m", when stringToMs, then parses case-insensitively for hours', () => {
    expect(stringToMs('1H')).toBe(MS_PER_HOUR);
    expect(stringToMs('2H15m')).toBe(2 * MS_PER_HOUR + 15 * MS_PER_MINUTE);
  });

  it('given empty, whitespace-only, or non-matching strings, when stringToMs, then returns 0', () => {
    expect(stringToMs('')).toBe(0);
    expect(stringToMs('   ')).toBe(0);
    expect(stringToMs('abc')).toBe(0);
    expect(stringToMs('no-digits-here')).toBe(0);
  });

  it('given uppercase M for months and lowercase m for minutes in "1M30m", when stringToMs, then distinguishes month vs minute units', () => {
    const expected = Math.floor(MS_PER_MONTH + 30 * MS_PER_MINUTE);
    expect(stringToMs('1M30m')).toBe(expected);
  });
});