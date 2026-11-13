import { describe, expect, it } from 'vitest';
import {
  isQuery, setAsQuery, isQueries, setAsQueries, isInfiniteQuery, setAsInfiniteQuery,
  useQuery, useQueries, useInfiniteQuery,
} from '../../src';

const helpers = [
  { name: 'query', is: isQuery, mark: setAsQuery },
  { name: 'queries', is: isQueries, mark: setAsQueries },
  { name: 'infinite query', is: isInfiniteQuery, mark: setAsInfiniteQuery },
];

describe('given query marker helpers, when inspecting results, then each hook has its own marker', () => {
  for (const helper of helpers) {
    it(`given a custom ${helper.name} object, when marked twice, then only its own helper recognizes the hidden marker`, () => {
      const result = { data: [] };
      expect(helper.is(result)).toBe(false);
      expect(helper.mark(result)).toBeUndefined();
      helper.mark(result);
      for (const other of helpers) expect(other.is(result)).toBe(other === helper);
      expect(Object.keys(result)).toEqual(['data']);
      expect(JSON.stringify(result)).toBe('{"data":[]}');
      const [symbol] = Object.getOwnPropertySymbols(result);
      expect(Object.getOwnPropertyDescriptor(result, symbol)).toEqual({ value: true, enumerable: false, writable: false, configurable: false });
      expect(helper.is({ ...result })).toBe(false);
      expect(helper.is(Object.create(result))).toBe(false);
    });

    it(`given non-object values, when checked as a ${helper.name}, then they are not recognized`, () => {
      for (const value of [null, undefined, false, 0, 'query', Symbol('query')]) {
        expect(helper.is(value)).toBe(false);
      }
    });
  }

  it('given disabled hooks, when created, then their results are marked automatically without fetching', () => {
    const fn = async (): Promise<any> => { throw new Error('A disabled query must not fetch'); };
    const single = useQuery({ fn, immediate: false });
    const multiple = useQueries([{ fn, immediate: false }]);
    const infinite = useInfiniteQuery({ fn, initialPageParam: 1, immediate: false });
    expect(isQuery(single)).toBe(true);
    expect(isQueries(multiple)).toBe(true);
    expect(isInfiniteQuery(infinite)).toBe(true);
    expect(isQuery(multiple)).toBe(false);
    expect(isQuery(infinite)).toBe(false);
    expect(isQuery(multiple.queries[0])).toBe(true);
    single.dispose();
    multiple.queries[0].dispose();
  });
});
