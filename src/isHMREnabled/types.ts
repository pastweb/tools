/**
 * Import metadata shape used to detect development Hot Module Replacement APIs.
 *
 * Vite exposes `hot`; Webpack 5 and compatible bundlers such as Rspack expose
 * `webpackHot` for strict ESM modules. Both properties are intentionally typed
 * as `unknown` because callers only need to know whether an HMR object exists.
 */
export type HotImportMeta = ImportMeta & {
  /** Vite HMR API. */
  hot?: unknown;
  /** Webpack/Rspack HMR API for strict ESM modules. */
  webpackHot?: unknown;
};
