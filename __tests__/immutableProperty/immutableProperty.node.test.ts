import { immutableProperty } from '../../src/immutableProperty';

describe('immutableProperty', () => {
  it('should make a single property immutable', () => {
    const obj = { a: 1, b: 2 };

    immutableProperty(obj, 'a');

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

  it('should make multiple properties immutable', () => {
    const obj = { x: 10, y: 20 };

    immutableProperty(obj, ['x', 'y']);

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

  it('should not affect properties not listed', () => {
    const obj = { a: 1, b: 2, c: 3 };

    immutableProperty(obj, 'b');

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

  it('should handle empty array without errors', () => {
    const obj = { a: 1, b: 2 };

    immutableProperty(obj, []);

    // Ensure all properties are still mutable
    obj.a = 3;
    obj.b = 4;
    expect(obj.a).toBe(3);
    expect(obj.b).toBe(4);
  });

  it('should handle non-existent properties gracefully', () => {
    const obj = { a: 1, b: 2 };

    immutableProperty(obj, ['a', 'c' as keyof typeof obj]); // 'c' does not exist on obj

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
