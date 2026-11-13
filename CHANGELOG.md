# Changelog

## Unreleased

### Fixed

- **Query-cache hydration**: empty expiration markers in snapshots no longer register unintended REST refetches during subsequent dehydration.

- **`createApiAgent` pagination**: `pagination: false` now disables pagination processing, and `getPageLimit()` uses the configured `defaultPageLimit`.
- **`getRouterLink` / `useRouterLink` `isActive`**: a link is active only when the current pathname is that path or a nested path under it (`/blog` on `/blog/post`). Sibling routes that only share a string prefix (`/dropdown` on `/dropdownmenu`) are no longer both active. Root `/` stays active for every pathname. Query, hash, and trailing slashes are ignored.
- **`kebabize`**: whitespace is treated as a separator, so `'Select an option'` becomes `'select-an-option'` instead of `'select- an- option'`. Consecutive hyphens collapse, and leading or trailing hyphens are omitted.

### Added

- **Default portal anchors**: added `walktour` to `DEFAULT_PORTAL_ANCHORS`, so `generateAnchors()` creates a dedicated anchor for guided tours.

- **`createWindowManager`**: added a DOM-free reactive manager for portal-backed desktop windows. It tracks immutable window snapshots, activation order, geometry, visibility, minimize/maximize/restore state, modal blocking, ownership, close requests, and application metadata through `meta` / `setMeta`. `createChild()` creates isolated view managers whose `closeAll`, `hideAll`, and `showAll` commands cascade from their parent; `dispose()` detaches a child tree. `hide`, `show`, `hideAll`, `showAll`, and `closeAll` provide application-wide commands, while `manageWindow(window)` centralizes standard taskbar behavior. Minimized or hidden modals release their workspace until restored or shown. `WINDOW_MANAGER_CONTEXT_KEY` gives framework integrations a shared context key for the application-owned manager. The factory owns its closure state directly and delegates transitions to focused helpers; it does not expose or require classes.

- **Query result markers**: documented `isQuery` / `setAsQuery` and added `isQueries` / `setAsQueries` and `isInfiniteQuery` / `setAsInfiniteQuery`. All three hooks mark their results automatically with distinct, non-enumerable symbols. Helpers are exported from the package root, API and hook barrels, and their hook entrypoints.

- **Optional urql integration**: `createUrqlAdapter` from `@pastweb/tools/api/urql`, with `@urql/core` marked as an optional peer dependency. API agents expose `gql.urql`, `query()`, and `mutation()`, with typed documents, optional variables, existing page-to-offset calculation, endpoint overrides, and authentication bridging.
- **GraphQL cache and SSR coordination**: one `QueryCache` registers multiple independent agents/adapters, delegates invalidation and prefetching, and transfers per-adapter urql state through versioned snapshots. Supports late adapter registration, snapshot slicing, no-store exclusion, and factory-created clients on SSR reset; legacy REST snapshots remain supported.
- **GraphQL hook results**: `useQuery` subscribes to urql cache updates and exposes `dispose()`. Both query and mutation hooks preserve returned errors, partial data, and extensions. Mutations execute explicitly and support success/error callbacks and cache invalidation.

- **`createApiAgent` / `QueryOptions` pagination**: `page` (1-based) and optional `limit` generate backward-compatible `offset`/`limit` URL parameters using `agent.pageToOffset`. The limit resolves from the option, existing URL, or `defaultPageLimit`; generated URLs keep default cache entries separate per page.
- **Pagination request headers**: explicit `offset`/`limit` URL parameters also send `Content-Range: <offset>-<limit>` by default, including existing offset URLs. `pagination.header` customizes the request and response header name. Explicit request headers are preserved, and excluded URLs skip automatic headers. The request's second number is the item count; response headers retain `start-end/total` semantics.
- **`CUSTOM_ELEMENT_ALPHABET`** (`'abcdefghijklmnopqrstuvwxyz'`): default alphabet for custom element unique segments; exported from `createIdCache` and the package root.
- **`IdCache.getCustomElementName(name, options?)`**: builds a unique custom element tag name via `getId` / `hashID` under `CUSTOM_ELEMENTS_SCOPE`.
  - `options.position`: `'suffix'` (default) or `'prefix'`.
  - `options.alphabet`: defaults to `CUSTOM_ELEMENT_ALPHABET`.
- **`GetCustomElementNameOptions`** / **`CustomElementNamePosition`** types exported from `createIdCache` and the package root.

### Breaking

- **`createIdCache` / `IdCache.getId`**: the second parameter is now `HashIDOptions` (same options object as `hashID`), not a prefix string.
  - Before: `getId(scope, 'prefix')`
  - After: `getId(scope, { prefix: 'prefix' })`
  - You can also pass `idLength`, `alphabet`, and `retries` through to `hashID`.

### Changed

- **Query hook internals**: `useQuery` and `useInfiniteQuery` now follow the `createApiAgent` helper pattern, with typed settings objects and focused `utils/` modules for fetching, state updates, and pagination. Public hook APIs remain unchanged.

- Child routes in `normalizePath` drop a leading `/` and join the parent path, so `/files` under `/docs` becomes `/docs/files`. Top-level routes are unchanged. Child redirects that start with `/` stay absolute from the router `base`.
- Improved `useMatchDevice` as a reactive tools helper for device matches and documented it under Browser functions.
- Documented both utilities under the README general Utility functions section and added focused node tests.
- Expanded `createIdCache` README: `getId` options, `getCustomElementName`, and related constants (`ELEMENTS_SCOPE`, `CUSTOM_ELEMENTS_SCOPE`, `CUSTOM_ELEMENT_ALPHABET`).
