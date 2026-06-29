import { describe, it, expect } from 'vitest';
import { setReadOnly } from '../../src';

describe('given the setReadOnly function', () => {
  it('given obj with a,b and setReadOnly(obj,"a"), when try set a throws, a stays, b mutable', () => {
    const obj = { a: 1, b: 2 };

    setReadOnly(obj, 'a');

    // Try changing the immutable property
    expect(() => {
      obj.a = 3;
    }).toThrowError(TypeError);

    // Ensure the property value did not change
    expect(obj.a).toBe(1);

    // Ensure other properties are still mutable
    obj.b = 3;
    expect(obj.b).toBe(3);
  });

  it('given obj x,y and immutable on ["x","y"], when try set either throws, values unchanged, and non-listed would be mutable', () => {
    const obj = { x: 10, y: 20 };

    setReadOnly(obj, ['x', 'y']);

    // Try changing the immutable properties
    expect(() => {
      obj.x = 15;
    }).toThrowError(TypeError);
    expect(() => {
      obj.y = 25;
    }).toThrowError(TypeError);

    // Ensure the property values did not change
    expect(obj.x).toBe(10);
    expect(obj.y).toBe(20);
  });

  it('given obj a,b,c immutable only b, when set b throws b unchanged, a and c still mutable', () => {
    const obj = { a: 1, b: 2, c: 3 };

    setReadOnly(obj, 'b');

    // Try changing the immutable property
    expect(() => {
      obj.b = 4;
    }).toThrowError(TypeError);

    // Ensure the property value did not change
    expect(obj.b).toBe(2);

    // Ensure other properties are still mutable
    obj.a = 4;
    obj.c = 5;
    expect(obj.a).toBe(4);
    expect(obj.c).toBe(5);
  });

  it('given obj and setReadOnly(obj, []), when set a or b, no throw and values change (all remain mutable)', () => {
    const obj = { a: 1, b: 2 };

    setReadOnly(obj, []);

    // Ensure all properties are still mutable
    obj.a = 3;
    obj.b = 4;
    expect(obj.a).toBe(3);
    expect(obj.b).toBe(4);
  });

  it('given obj a,b and immutable ["a","c" nonexist], when set a throws a unchanged, b remains mutable', () => {
    const obj = { a: 1, b: 2 };

    setReadOnly(obj, ['a', 'c' as keyof typeof obj]); // 'c' does not exist on obj

    // Ensure the existing property is immutable
    expect(() => {
      obj.a = 3;
    }).toThrowError(TypeError);
    expect(obj.a).toBe(1);

    // Ensure the other existing property is still mutable
    obj.b = 4;
    expect(obj.b).toBe(4);
  });
});
