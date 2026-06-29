/**
 * @deprecated Use the environment detection constants exported from `./envs`
 * (e.g. `isServer` or `!isBrowser`) instead.
 */
export const isSSR: boolean = typeof window === 'undefined';
