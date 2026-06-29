import { describe, it, expect } from 'vitest';
import { assign } from '../../src/assign';
import { isObject } from '../../src/isObject';

describe('given the assign function', () => {
  it('given an empty target object, when assign is called with the nested path "first.second.third" and an empty object value, then "first", "second" and "third" are objects', () => {
    const test: Record<string, any> = {};

    assign(test, 'first.second.third', {});

    expect(isObject(test.first)).toBe(true);
    expect(isObject(test.first.second)).toBe(true);
    expect(isObject(test.first.second.third)).toBe(true);
  });

  it('given an empty target object, when assign is called with the nested path "first.second.third" and an empty object value, then "first" and "second" have a single property each and "third" has no properties', () => {
    const test: Record<string, any> = {};
    
    assign(test, 'first.second.third', {});

    expect(Object.keys(test.first).length).toBe(1);
    expect(Object.keys(test.first.second).length).toBe(1);
    expect(Object.keys(test.first.second.third).length).toBe(0);
  });

  it('given an empty target object, when assign is called with the nested path "first.second.third" and an object with 7 properties, then "first" and "second" have a single property each and "third" has 7 properties', () => {
    const test: Record<string, any> = {};
    
    assign(test, 'first.second.third', {
      one: 110,
      two: 55,
      three: 170,
      for: 85,
      five: 130,
      six: 180,
      seven: 330,
    });

    expect(Object.keys(test.first).length).toBe(1);
    expect(Object.keys(test.first.second).length).toBe(1);
    expect(Object.keys(test.first.second.third).length).toBe(7);
  });

  it('given an empty target object, when assign is called with the nested path "first.second.third", a value object with 7 properties and the returnNew flag, then it returns a new object where "first" and "second" have one property and "third" has 7', () => {
    const test: Record<string, any> = {};
    
    const result = assign(test, 'first.second.third', {
      one: 110,
      two: 55,
      three: 170,
      for: 85,
      five: 130,
      six: 180,
      seven: 330,
    }, true) as Record<string, any>;

    expect(Object.keys(result.first).length).toBe(1);
    expect(Object.keys(result.first.second).length).toBe(1);
    expect(Object.keys(result.first.second.third).length).toBe(7);
  });
});
