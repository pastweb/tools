# Changelog

- Added `isHMREnabled` to detect Vite (`import.meta.hot`) and Webpack/Rspack-compatible (`import.meta.webpackHot`) HMR metadata.
- Added `getFunctionSignature` to create a defensive source-code signature for function values.
- Added shared `Island` hydration contracts, defaults, context key exports, and `@pastweb/tools/Island` package subpaths for framework adapters.
- Added the exported `QueryKey` type for `agent.get`, query hooks, and query-cache helpers.
- Documented both utilities under the README general Utility functions section and added focused node tests.
