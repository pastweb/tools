/**
 * Creates a safe, serialisable representation of a store state.
 *
 * Functions, symbols, and circular references are represented as strings so a
 * snapshot can be inspected or transferred to a development tool without
 * throwing during serialisation.
 */
export function serializeSnapshot(value: unknown, seen = new WeakMap<object, unknown>()): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === 'function') {
    return `[Function${value.name ? ` ${value.name}` : ''}]`;
  }

  if (typeof value === 'symbol') return value.toString();
  if (typeof value !== 'object') return value;

  if (value instanceof Date) return value.toISOString();
  if (seen.has(value)) return '[Circular]';

  const result: Record<string, unknown> | unknown[] = Array.isArray(value) ? [] : {};
  seen.set(value, result);

  for (const key of Object.keys(value)) {
    const item = serializeSnapshot((value as Record<string, unknown>)[key], seen);

    if (Array.isArray(result)) result.push(item);
    else result[key] = item;
  }

  return result;
}
