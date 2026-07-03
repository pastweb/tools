import type { HotImportMeta } from './types';

/**
 * Checks whether import metadata exposes a Hot Module Replacement API.
 *
 * Vite exposes HMR through `import.meta.hot`. Webpack 5 and compatible
 * bundlers such as Rspack expose it through `import.meta.webpackHot` when code
 * is compiled as strict ESM. Passing `meta` is useful for tests and adapters;
 * omitting it checks this module's own `import.meta`.
 *
 * @param meta - Import metadata to inspect. Defaults to this module's `import.meta`.
 * @returns `true` when either Vite or Webpack-compatible HMR metadata is present.
 *
 * @example
 * ```ts
 * if (isHMREnabled()) {
 *   // Refresh development-only state when the bundler hot-reloads a module.
 * }
 * ```
 */
export function isHMREnabled(meta: HotImportMeta = import.meta as HotImportMeta): boolean {
  const { hot, webpackHot } = meta;
  return !!(hot || webpackHot);
}
