# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Deprecated
- `isSSR` is deprecated. Use the environment detection constants from `envs` instead (e.g. `isServer` or `!isBrowser`).

### Added
- `useInfiniteQuery` hook under `src/api/hooks/useInfiniteQuery`. It manages ordered `pages` and `pageParams`, supports `fetch()` reset, `fetchNextPage()` append, and `fetchPreviousPage()` prepend flows, exposes the same lifecycle status model as `useQuery`, supports retry options, and can infer next/previous pages from agent pagination metadata when custom page-param resolvers are omitted. Added browser tests in `useInfiniteQuery.web.test.ts`.
- `createQueryCache({ refetchOnReconnect })` for browser `online` refetch checks, plus `queryCache.invalidateQueries(keys)` to invalidate multiple keys by delegating to `invalidateQuery`.
- `useQuery` now exposes `status` (`pending` | `success` | `error`), `fetchStatus` (`idle` | `fetching`), and `responseStatus` (numeric HTTP status or `null`). Existing booleans are derived from these values, so `isLoading` now means first fetch only while `isFetching` covers any fetch. `useQueries` exposes aggregate `status`, aggregate `fetchStatus`, and ordered `responseStatuses`.
- `useQueries` hook under `src/api/hooks/useQueries`. It creates multiple `useQuery` instances, preserves child query order, exposes aggregate flags/data/errors, supports `{ queries: [...] }` and array-form configs, and includes browser tests in `useQueries.web.test.ts`.
- `retry` and `retryDelay` support for `useQuery` and `useMutation`. Retries are hook-level only and wrap the provided `fn` without changing cache behavior. `retry` accepts `boolean`, `number`, or a predicate function; `retryDelay` accepts milliseconds, a `stringToMs` duration string, or a function. Added tests in `useQueryRetry.web.test.ts` and `useMutationRetry.web.test.ts`, plus README / `QUERY.md` updates.
- `agent.get(url, { select })` in `QueryOptions`. `select` projects the returned `response.data` for the current caller while the shared `QueryCache` keeps the raw response data. `response.onData(...)` callbacks are wrapped with the same selector so cache-driven updates keep the projected shape. Added browser tests in `tests/createApiAgent/selectOption.web.test.ts` and updated README / `QUERY.md`.
- `CacheOptions` for `createQueryCache({ refetchOnWindowFocus?: boolean, refetchOnReconnect?: boolean })`. When `true` (default `false`), and only in the browser, window `focus` or `online` re-runs all `checker` functions stored in `recallCache`. Tests in `createQueryCache.web.test.ts`. Updated README + TSDoc.
- `createMicroStore` actions can now access the mutable internal state via `this.state` (in addition to the existing setup `select` helper). New exported type `MicroStoreActionsContext<S>` for typing `this` in actions. Updated TSDoc, README, and tests (`createMicroStore.node.test.ts`).
- **SSR / hybrid render primitives** (Phase 1 of `PLAN.md`):
  - `runSSRCycle` — framework-agnostic orchestrator: collect → `resolveAsyncTasks` → collect → `dehydrate` → `hydrate` → render, with static downgrade when the SSR tracker reports dynamic behavior.
  - `agent.get({ ssr, revalidate })` — `ApiSSRMode` (`'auto' | 'static' | 'dynamic' | 'no-store'`) reports to the active SSR tracker via `reportApiSSRToTracker`.
  - `createDependencyFingerprint` — stable fingerprint from tracker dependencies for SSR router manifests.
  - `sliceDehydratedState(snapshot, queryKeys)` — island-scoped query-cache slices for partial hydration.
  - `queryCache.resetForSSR()` — clears in-memory cache before each SSR request cycle.
  - Tests: `runSSRCycle.node.test.ts`, `ssrTracker.node.test.ts`, `ssrOption.node.test.ts`, `sliceDehydratedState.node.test.ts`. Updated `QUERY.md`, `PLAN.md`, and README.
  - `setSSRDehydratedState` / `getSSRDehydratedState` / `clearSSRDehydratedState` — query-cache snapshot holder for final SSR render and island slice embedding.
  - Exported `serializeQueryKey` from the package root.

### Changed
- SSR helpers now live under `src/ssrUtils` with public subpath exports from `@pastweb/tools/ssrUtils`. Root exports remain available for convenience.
- **Query cache lifecycle options** (`createQueryCache` / `agent.get` `QueryOptions`):
  - Renamed `callOnExpired` → `fetchOnExpired` (same semantics: `true` = passive stale check on next get; `string` = active polling timer).
  - Added `fetchOnInvalidate` (`true` | duration string) — auto-refetch after `invalidateQuery`.
  - Added `removeOnExpired` — delete entry when `expireIn` is exceeded.
  - Added `removeOnInvalidate` — delete entry immediately on invalidation.
  - Fixed `scheduleRecall` timer scheduling and `invalidateQuery` key handling for invalidate-all.
  - Options are persisted in `dehydrate`/`hydrate` snapshots. Updated TSDoc (types, utils, `QUERY_CACHE_CONTEXT_KEY`, `QueryConfig`), README, tests (`createQueryCache.node.test.ts`, `createQueryCache.web.test.ts`), and renamed `callOnExpired` references in existing tests.
- Replaced internal `isSSR` usage across the package with `isBrowser` / `isServer` from `envs` (browser/DOM checks use `isBrowser`; server-only SSR logic uses `isServer`). The deprecated `isSSR` export remains for backward compatibility.
- `dehydrate()` has been removed from the `Agent` interface (and runtime object). It is now only available on `QueryCache` (i.e. `agent.cache.dehydrate()` or the shared cache instance returned by `createQueryCache()`). This aligns with using a shared cache for SSR collection scenarios.
- Refactored `createApiAgent` module structure under `src/api/`: split logic into `createApiAgent/`, `createQueryCache/`, `useQuery.ts`, `useMutation.ts`, and shared `types.ts` and `utils.ts` for better maintainability. All public and internal functions (and types) now have comprehensive TSDoc. The public API surface remains the same.
- In `getMethod` (used by `agent.get`): a `console.error` is now emitted when cache-related options (`queryKey` or `expireIn`) are used on a call but the agent was not created with `queryCache` in `AgentOptions`. This helps catch cases where caching features are accidentally disabled.

### Added
- Environment detection constants expanded in `envs`:
  - New constants: `isNode`, `isDeno`, `isBun`, `isElectron`
  - `isServer` is now a composite that returns `true` for Node.js, Deno, **or** Bun.
  - All env constants exported from main package.
  - These provide more precise platform detection than the deprecated `isSSR`.
- Tests for the envs constants (`tests/envs/envs.web.test.ts` and `tests/envs/envs.node.test.ts`), now covering `isNode`, `isDeno`, `isBun`, and updated `isServer` behavior.
- Structured `queryKey?: unknown[]` support (hybrid with URL keys): `QueryConfig` (for `useQuery`) and `QueryOptions` (passed to `agent.get`) now accept optional `queryKey`. When an array is provided, it is serialized (via JSON.stringify) and used as the cache key for `set`/`get`/`dehydrate` etc; if omitted the request URL is used as before. Legacy string `queryKey` still warns and falls back to URL. This enables future TanStack-like cache identity while preserving existing URL-keyed usage.
- `registerAsyncTask` and `resolveAsyncTasks` utilities. These allow code to register asynchronous work during an initial render/ collection pass on the server; `resolveAsyncTasks` executes the registered work (with iterative support for tasks that register additional work while running). Useful for patterns involving asynchronously loaded components.
- Dedicated server-side and browser tests for `useQuery` + cache (`useQuery.node.test.ts`, updates to `useQuery.web.test.ts` and `createApiAgent.web.test.ts`) using GWT titles and covering shared cache, dehydrate registration, callOnExpired, etc.
- `ready: Promise<void>` property on `ViewRouter`.
  - Resolves after the initial route has been resolved (browser auto-init, `initialRequest`, or manual `setRequest`/`initialSetup`).
  - Guarantees that `currentRoute`, `location`, etc. are correct on first access after `await router.ready`.
- `initialRequest?: NodeRequest` option to `RouterOptions`.
  - When provided in an SSR context, the router automatically initializes using the supplied server request so that the first read of `currentRoute` is already the correct matched route.
- Full support for reactive router state. The following properties on the returned `ViewRouter` are now powered by the library's reactivity system:
  - `currentRoute`
  - `location`
  - `isResolving`
  - `paths`
  - `base`
  - `documentSettings`
  - `request` (SSR)
- Enhanced `ServerRequest` type with additional derived fields from request headers/cookies (populated automatically by `normalizeServerRequest`):
  - `language`: Best-guess primary language from `Accept-Language`.
  - `os`: Detected operating system, now including version when reliably extractable (e.g. `"macOS 10.15.7"`, `"Windows 10/11"`, `"iOS 17.2"`, `"Android 14"`).
  - `colorScheme`: User's preferred color scheme (`'light' | 'dark' | 'no-preference'`) from `Sec-CH-Prefers-Color-Scheme` client hints or common cookies.
- `useLocation` hook (under `createViewRouter` mediator hooks). Returns a dedicated reactive `Location` proxy kept in sync via an internal `effect` + the `update` utility. Allows safe use of `effect(() => loc.pathname)` even when the value is captured from inside a mediator/context. New dedicated test file `useLocation.web.test.ts`.
- `useRouter` hook (under `createViewRouter` mediator hooks). Added full TSDoc with usage examples. New dedicated test file `useRouter.web.test.ts` covering context resolution inside mediators, error cases (outside mediator and missing router in context), and using the returned router for navigation and reactive state observation.
- `useNavigate` hook (under `createViewRouter` mediator hooks). Returns `router.navigate` for convenient imperative navigation from within mediators. Added full TSDoc with usage examples. New dedicated test file `useNavigate.web.test.ts` (following the same organization as `useLocation.web.test.ts` and `useRouter.web.test.ts`).
- `usePaths` hook (under `createViewRouter` mediator hooks). Returns a reactive `{ readonly value: Route[] }` (supports optional `FilterDescriptor` like `filterRoutes`). Uses `computed` internally so the value automatically updates when routes are added. Added full TSDoc with usage examples. New dedicated test file `usePaths.web.test.ts`.
- `useRouterLink` hook (under `createViewRouter` mediator hooks). Returns a reactive `RouterLink` object directly (following the same `reactive(...)` + internal `effect` + `update(...)` pattern as `useLocation`). `isActive` / `isExactActive` automatically stay in sync with router location changes. Added full TSDoc with usage examples. New dedicated test file `useRouterLink.web.test.ts`.
- `useSearchParams` hook (under `createViewRouter` mediator hooks). Returns a reactive `{ params: URLSearchParams; setSearchParams: (searchParams: URLSearchParams) => void }` object. `params` is kept in sync via an internal `effect` (following the reactive object + effect + update pattern of `useLocation`). Added full TSDoc with usage examples. New dedicated test file `useSearchParams.web.test.ts`.
- New TSDoc comments with usage examples for `createViewRouter`, `RouterOptions.initialRequest`, `ViewRouter.ready`, `useLocation`, `useRouter`, `useNavigate`, `usePaths`, `useRoute`, `useRouterLink`, and `useSearchParams`.
- "Mediator hooks" documentation section under `createViewRouter` in README (for `useRouter`, `useLocation`, `useNavigate`, `usePaths`, `useRoute`, `useRouterLink`, and `useSearchParams`).
- Additional tests covering `ready` resolution in both browser and SSR scenarios, including `initialRequest` + reactivity flows, and header-derived `ServerRequest` fields.
- Major updates to the reactivity system (`computed`, `effect`, and related utilities):
  - `computed` no longer always wraps the result in `{ readonly value: T }`. When the getter returns an object (detected via `isObject`, including arrays), it returns a transparent readonly proxy to that object, allowing direct property access (`computedObj.prop`). `.value` remains available in all cases and returns the raw result. Updated `Computed<T>` type to reflect this (`T extends object ? Readonly<T> : { readonly value: T }`).
  - Both `computed` (getter) and `effect` (callback) now support async functions. Async getters in `computed` use stale-while-revalidate semantics (previous value is returned while a new computation is pending).
  - `effect` source now accepts a function returning an array of dependencies: `effect(fn, () => [dep1, dep2, myComputed.prop])` (in addition to the per-item array form).
  - Internal marker symbols (`REF`, `REACTIVE`, `COMPUTED`) are now consistently installed via `setSymbolKey` (instead of raw `Object.defineProperty`).
  - Added `isComputed()` utility (symmetric to `isRef` / `isReactive`).
  - Fixed dependency tracking when reading from `computed` inside an `effect` (proper `activeEffect` save/restore during computation).
  - `computed` results (both shapes) always carry the `REF` marker so they remain usable as refs in `effect()` source handling and with `isRef()`.
  - Added / updated tests for async support, object-shaped computed + direct property observation in effects, and the new source forms.
  - Updated TSDoc and README documentation.
- Added example for the `isRef` utility in README (and expanded its TSDoc) demonstrating that a "pure" ref (from `ref()`, not a computed) must be checked with `if (isRef(result) && !isComputed(result)) { ... }`. This clarifies the intentional sharing of the `REF` marker on computed results.
- `getType` utility: added comprehensive TSDoc, ensured export from the root `index.ts`, wrote/expanded tests covering all primitive types (Undefined, Null, Boolean, Number (incl. NaN), String, Symbol, BigInt and more), added/ensured documentation under the "Object functions" section of the README in correct alphabetic order (after deepMerge, before isObject). Updated changelog.
- `hashID` utility: added comprehensive TSDoc (accurate description, options, examples, and note linking to `createIdCache`). Updated and expanded the full documentation section in README.md with correct `HashIDOptions`, behavior details, examples, use cases, performance notes, and cross-reference to the more advanced ID cache utility.
- `isType` utility: added full TSDoc with parameter/return details, important behavior notes (null/undefined guard), and examples. Updated the README documentation section (corrected example outputs, added Notes and Edge Cases, aligned style with `getType`).
- `setSymbolKey` utility: added comprehensive TSDoc explaining its purpose for installing hidden marker symbols (used by reactivity, portals, globalContext, etc.). It was already exported from the root `index.ts` (and re-exports `DEFAULT_SYMBOL_DESCRIPTOR` + `Descriptor` type). Added dedicated documentation section under "Utility functions" in the README (with examples, use cases, notes) and updated the GlobalContext constants list + the `isRef`/`isReactive`/`isComputed` section to link to it. Updated changelog.
- Major documentation reorganization and improvements in README.md:
  - Created a new top-level "Routing" main section (placed in correct alphabetic order).
  - Moved the entire `createViewRouter` content and all its subsections (filterRoutes, Route Object, routeDive, Router mediator hooks + all `use*` hooks) into the new Routing section.
  - Made the full Summary (table of contents) and every level of subsections strictly alphabetically ordered.
  - Ensured the body documentation now follows exactly the same order as the summary.
  - Renamed the "GlobalContext" section and all references/links to "Global Context".
  - Added an improved high-level "Documentation Overview" section describing each major category.
  - Added a License section at the very end of the README (noting it is distributed under the MIT licence).
  - Shortened the package.json description for better display while keeping it informative (keywords were already good).
- `useColorScheme` hook (under `createMatchScheme`). Returns a reactive `[ColorSchemeInfo, (mode: string) => void]` tuple powered by the library's `reactive` + `update` utilities for live syncing on mode/system changes. Supports passing an existing `MatchScheme` or creates one internally via `createMatchScheme`. Added TSDoc with examples, new test file `useColorScheme.web.test.ts` (GWT style), and documentation section in README under Browser functions. Updated root and sub-module exports + package.json. Updated changelog.
- `stringToMs` utility: converts duration strings (same format as `isDateYoungerOf`) to milliseconds. Added comprehensive TSDoc, tests (`tests/stringToMs/stringToMs.node.test.ts`, GWT style), documentation under the "Date and Time" section in README, and export from the root `index.ts` + `package.json`. Fixed minute (`m`) vs month (`M`) parsing so lowercase `m` is correctly treated as minutes (used internally by query-cache delay scheduling).

### Changed
- Query cache logic extracted to its own module `src/createApiAgent/createQueryCache.ts` (exported). Agents now accept `queryCache?: QueryCache` to reuse an external cache instance (useful for sharing across agents in SSR). Internal `get` always uses the provided or created cache when `cache: true` (or via the cache-aware path).
- `useRoute` hook (and siblings) evolved with reactivity: initially to direct reactive object via `reactive + effect + update` (no more {value}), later further to direct `computed` transparent proxy for the route data (simpler, leverages object computed support). See later entries for final form. Direct prop access + effect observation supported throughout. TSDoc/tests/docs kept updated.
- `usePaths` hook redesigned to return the (optionally filtered) routes directly as a reactive `Readonly<Route[]>` (transparent readonly proxy from `computed`). You now use `paths.length`, `paths.map(...)`, `paths.some(...)` etc. directly with no `.value` wrapper. This is consistent with `router.paths`, the direct array proxy shape for object results from `computed`, and the patterns of other mediator hooks. The previous `{ readonly value: Route[] }` shape and internal getter wrapper have been removed. Updated TSDoc, implementation, tests, and README.
- `useLocation`, `useRoute`, and `useRouterLink` mediator hooks further redesigned for the transparent object `computed` support: now simply `return computed(() => router.xxx)` (stable proxy with direct prop access + tracking) instead of the previous `reactive + internal effect + update(...)` syncing logic. `useSearchParams` now derives its `params` via `computed` (still exposing real `URLSearchParams` instances and the setter) with no manual effect for data sync. This is simpler, removes `update` dependency from the hooks, and fully leverages new computed object/array proxies while preserving capture-from-mediator + effect-on-props behavior. TSDoc, tests, and comments updated.
- `useQuery` and `useMutation` already used `reactive` for state, `ref`/`isRef` for immediate, `effect` with array-of-sources, and declared support for `Computed`/`Reactive`/`Ref` in query sources (which work thanks to REF marker on computed). Added a test case exercising `computed` as a source (existing tests already covered ref sources, reactive sources, immediate-as-ref, errors, placeholderData, isPending vs isFetching during refetch, cache invalidation, manual fetch, and callOnExpired). No other redesign needed; they fit the updated reactivity well.
- Router state properties are now reactive. The recommended way to react to route/location changes is via the library's reactivity primitives:
  ```ts
  import { effect, computed } from '@pastweb/tools';

  effect(() => {
    console.log(router.currentRoute.path, router.location);
  });

  const currentPath = computed(() => router.currentRoute.path);
  ```
- `createViewRouter` now resolves `ready` directly in the appropriate initialization paths (no longer relies on internal event emission for this purpose).
- Improved SSR ergonomics: using `initialRequest` + `await router.ready` eliminates the previous transient `EMPTY_ROUTE` that was always present immediately after construction in SSR.

### Removed
- `SSRWait` (and all associated `SharedArrayBuffer` / `Atomics` blocking logic) from `useQuery` config and implementation. The previous SSR blocking behavior is removed. SSR use cases are now served by passing a shared `queryCache` to agents and using `dehydrate()` / executing the returned functions during a collection pass (see updated docs and `createQueryCache`).
- `onRouteChange(fn)` and `onRouteAdded(fn)` methods from the `ViewRouter` interface and implementation.
  - These were previously powered by an internal event emitter.
  - The event emitter module (`createEventEmitter`) itself remains a first-class exported utility and can still be used directly if needed.
- All internal usage of the event emitter for routing notifications inside `createViewRouter`.
- Tests and documentation that referenced the removed `onRoute*` methods.

### Fixed
- Transient `EMPTY_ROUTE` state on first access is now avoidable by awaiting `router.ready` (or using `initialRequest` in SSR).
- `ready` now consistently resolves on the first meaningful route resolution across browser and SSR paths (including after `setBase`, `refreshCurrentRoute`, etc.).

## [2.2.2] - Previous release

See git history for earlier changes.

[Unreleased]: https://github.com/pastweb/tools/compare/v2.2.2...HEAD
