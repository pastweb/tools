import { describe, it, expect } from 'vitest';
import { isDateYoungerOf } from '../../src';

describe('given the isDateYoungerOf function', () => {
  it('given a date 5m ago and duration "10m", when isDateYoungerOf, then true', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 5); // 5 minutes ago

    expect(isDateYoungerOf(fiveMinutesAgo, '10m')).toBe(true);
  });

  it('given date 10m ago and "5m", when is..., then false', () => {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago

    expect(isDateYoungerOf(tenMinutesAgo, '5m')).toBe(false);
  });

  it('given year ago dates with 1Y 1Y1D 1Y2D, when isDateYoungerOf, then false, false, true respectively', () => {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
    const oneYearAndOneDayAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() - 1, now.getHours(), now.getMinutes());

    expect(isDateYoungerOf(oneYearAgo, '1Y')).toBe(false);
    expect(isDateYoungerOf(oneYearAndOneDayAgo, '1Y1D')).toBe(false);
    expect(isDateYoungerOf(oneYearAndOneDayAgo, '1Y2D')).toBe(true);
  });

  it('given hour diffs and durations 2h/1h/1h30m/1h31m , when isDateYoungerOf, then true/false/false/true', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 1, now.getMinutes()); // 1 hour ago
    const twoHoursAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 2, now.getMinutes()); // 2 hours ago
    const oneHourAndThirtyMinutesAgo = new Date(now.getTime() - 1.5 * 60 * 60 * 1000); // 1 hour and 30 minutes ago

    expect(isDateYoungerOf(oneHourAgo, '2h')).toBe(true);
    expect(isDateYoungerOf(twoHoursAgo, '1h')).toBe(false);
    expect(isDateYoungerOf(oneHourAndThirtyMinutesAgo, '1h30m')).toBe(false);
    expect(isDateYoungerOf(oneHourAndThirtyMinutesAgo, '1h31m')).toBe(true);
  });

  it('given exact 1 day ago with 1D and 1D1s, when is..., then false and true', () => {
    const now = new Date();
    const exactOneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago (1 day)
    
    expect(isDateYoungerOf(exactOneDayAgo, '1D')).toBe(false);
    expect(isDateYoungerOf(exactOneDayAgo, '1D1s')).toBe(true); // 1 second more than 1 day
  });

  it('given invalid date string and any duration, when isDateYoungerOf, then false', () => {
    expect(isDateYoungerOf(new Date('invalid-date'), '1D')).toBe(false);
  });
});
