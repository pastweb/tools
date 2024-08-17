import { assign } from '../../src/assign';
import { isObject } from '../../src/isObject';

describe('assign', () => {
  it('"first", "second" and "third" should be an Object.', () => {
    const test: Record<string, any> = {};

    assign(test, 'first.second.third', {});

    expect(isObject(test.first)).toBe(true);
    expect(isObject(test.first.second)).toBe(true);
    expect(isObject(test.first.second.third)).toBe(true);
  });

  it('"first", "second" shold have a single property and "third" should have not be any property.', () => {
    const test: Record<string, any> = {};
    
    assign(test, 'first.second.third', {});

    expect(Object.keys(test.first).length).toBe(1);
    expect(Object.keys(test.first.second).length).toBe(1);
    expect(Object.keys(test.first.second.third).length).toBe(0);
  });

  it('"first", "second" shold have a single property and "third" should have 7 properties.', () => {
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

  it('should return a new Object where "first", "second" shold have a single property and "third" should have 7 properties.', () => {
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
