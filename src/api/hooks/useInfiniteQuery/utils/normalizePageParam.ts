

/**
 * Converts null and false page parameters to the end-of-pagination sentinel.
 * @example
 * ```ts
 * const next = normalizePageParam(null); // undefined
 * ```
 */
export function normalizePageParam<TPageParam>(param: TPageParam | null | undefined | false): TPageParam | undefined {
  return param === null || param === false ? undefined : param;
}
