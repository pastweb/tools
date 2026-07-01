# @pastweb/tools

A collection of **production-ready**, **tree-shakeable** utility functions for common tasks in modern JavaScript and TypeScript applications.

## Features

- **Broad coverage** — Async operations, browser utilities, a full reactivity system, client-side routing, DOM helpers, object utilities, string transforms, SCSS tools, and more.
- **Lightweight & optimized** — Fully tree-shakeable with minimal dependencies.
- **TypeScript-first** — Excellent type definitions, generics, and editor support out of the box.
- **Framework-agnostic** — Works in any environment. Includes first-class support for mediator patterns and global context (useful in React, Vue, Svelte, Solid, etc.).
- **Well documented** — Every utility comes with clear syntax, parameters, return types, real-world examples, use cases, notes, and edge cases.
- **Modern architecture** — Built around reactivity (`reactive`, `ref`, `computed`, `effect`), async-first stores, unique ID generation, and clean separation of concerns.

## Installation

```bash
npm i -S @pastweb/tools
# or
pnpm i -S @pastweb/tools
# or
yarn add -S @pastweb/tools
```

## Documentation Overview

The documentation is organized into the following major categories. Each section provides complete TypeScript definitions, practical examples, real-world use cases, and notes on edge cases.

- **Async functions** — Tools for working with promises, API clients (`createApiAgent`, `useQuery`, `useMutation`), async stores, event emitters, debouncing, and throttling.
- **Browser functions** — Client-side utilities including device detection, color scheme management, persistent storage, and the complete routing system.
- **Date and Time** — Helpers for comparing dates and converting duration strings to milliseconds.
- **Element functions** — DOM and UI utilities (class name composition, portals, anchor generation, element sizing).
- **Object functions** — General-purpose object utilities (deep merging, property assignment, type checking, immutability helpers, and more).
- **Reactivity** — A complete reactivity system (`reactive`, `ref`, `computed`, `effect`) together with supporting utilities and the Global Context pattern.
- **Routing** — The full `createViewRouter` solution, including route definition, matching, navigation, and mediator hooks for framework integration.
- **SSR utilities (experimental)** — Server-render coordination helpers under `ssrUtils`, including `asyncTasks` (`registerAsyncTask`, `resolveAsyncTasks`), `runSSRCycle`, and SSR tracker utilities.
- **String functions** — String transformation utilities (camelCase, kebab-case, friendly ID generation).
- **Styles** — SCSS mixins and tools for responsive design, theming, and layout utilities.
- **Utility functions** — General-purpose helpers (memoization, no-op, and similar tools).

This project is distributed under the MIT licence.


## Summary

- [Async functions](#async-functions)
  - [createApiAgent](#createapiagent)
    - [createQueryCache](#createquerycache)
    - [useMutation](#usemutation)
    - [useInfiniteQuery](#useinfinitequery)
    - [useQueries](#usequeries)
    - [useQuery](#usequery)
  - [createAsyncMicroStore](#createasyncmicrostore)
  - [createAsyncStore](#createasyncstore)
    - [normalizeAsyncQueue](#normalizeasyncqueue)
  - [createEventEmitter](#createeventemitter)
  - [createLangAsyncStore](#createlangasyncstore)
  - [createMatchSchemeAsyncStore](#creatematchschemeasyncstore)
  - [debounce](#debounce)
  - [throttle](#throttle)
- [Browser functions](#browser-functions)
  - [createMatchDevice](#creatematchdevice)
  - [createMatchScheme](#creatematchscheme)
    - [useColorScheme](#usecolorscheme)
  - [createStorage](#createStorage)
- [Date and Time](#date-and-time)
  - [isDateYoungerOf](#isdateyoungerof)
  - [stringToMs](#stringtoms)
- [Element functions](#element-functions)
  - [cl](#cl)
  - [createEntry](#createentry)
  - [createPortal](#createportal)
    - [anchorsSetup](#anchorssetup)
    - [generateAnchors](#generateanchors)
  - [getFullElementSize](#getfullelementsize)
- [Object functions](#object-functions)
  - [assign](#assign)
  - [deepMerge](#deepmerge)
  - [getType](#gettype)
  - [isObject](#isobject)
  - [isType](#istype)
  - [remove](#remove)
  - [select](#select)
  - [setReadOnly](#setreadonly)
  - [setSymbolKey](#setsymbolkey)
  - [update](#update)
  - [withDefaults](#withdefaults)
- [Reactivity](#reactivity)
  - [computed](#computed)
  - [createMicroStore](#createmicrostore)
  - [createMicroStoreCollector](#createmicrostorecollector)
  - [effect](#effect)
  - [Global Context](#global-context)
  - [isRef / isReactive / isComputed](#isref-isreactive-iscomputed) (utilities)
  - [reactive](#reactive)
  - [ref](#ref)
- [Routing](#routing)
  - [createViewRouter](#createviewrouter)
    - [filterRoutes](#filterroutes)
    - [Route Object](#route-object)
    - [routeDive](#routedive)
    - [Router mediator hooks](#router-mediator-hooks)
      - [useLocation](#uselocation)
      - [useNavigate](#usenavigate)
      - [usePaths](#usepaths)
      - [useRoute](#useroute)
      - [useRouter](#userouter)
      - [useRouterLink](#userouterlink)
    - [useSearchParams](#usesearchparams)
- [SSR utilities (experimental)](#ssr-utilities-experimental)
  - [registerAsyncTask / resolveAsyncTasks](#registerasynctask--resolveasynctasks)
  - [runSSRCycle](#runssrcycle)
  - [SSR tracker (`createSSRTracker`)](#ssr-tracker-createssrtracker)
- [String functions](#string-functions)
  - [camelize](#camelize)
  - [createIdCache](#createidcache)
  - [hashID](#hashid)
  - [kebabize](#kebabize)
- [Styles](#styles)
  - [colorFilter](#colorfilter)
  - [flex-layout](#flex-layout)
  - [Responsiveness mixins](#responsiveness-mixins)
  - [setup](#setup)
- [Utility functions](#utility-functions)
  - [Environment detection constants (envs)](#environment-detection-constants-envs)
  - [memo](#memo)
  - [noop](#noop)

---
## Async functions

### `createApiAgent`

Creates a configured Axios-based API client ("agent") with optional caching,
pagination support, request interceptors for auth, and SSR-friendly query collection.

All functions and types have comprehensive TSDoc (including internal types).

> #### Syntax
```typescript
function createApiAgent(options?: AgentOptions): Agent;
```
Parameters
* `options`: `AgentOptions` _(optional)_ The options for the API agent.
  * `queryCache`: `QueryCache` _(optional)_
    * Pass `createQueryCache()` to enable caching for GETs + SSR support (dehydrate/hydrate).
    * This is the recommended way. The agent will use the provided instance for caching.
  * `headers`: `Record<string, any>` _(optional)_ (default: {})
    * Default headers to include on every request.
  * `withCredentials`: `boolean` _(optional)_ (default: false)
    * Indicates whether cross-site Access-Control requests should be made using credentials.
  * `pagination`: `boolean | PaginationConfig` _(optional)_ (default: `true`)
    * Enables pagination parsing from Content-Range header.
  * `exclude`: `string | RegExp | Array<string | RegExp>` _(optional)_
    * URLs or patterns to exclude from request interception.
  * `onGetValidToken`: `() => ValidTokenResponse | Promise<ValidTokenResponse>` _(optional)_
    * Function to get a valid token for authorization.
  * `onUnauthorizedResponse`: `() => void | Promise<void>` _(optional)_
    * Callback for unauthorized responses.

Returns
* `Agent`
  * The configured API agent.

Methods
* `setAgentOptions(options: AgentOptions): void`
  * Sets the agent configuration.
* `mergeAgentConfig(newSettings: AxiosRequestConfig): void`
  * Merges new settings into the existing agent configuration.
* `getPageLimit(limit?: PageLimit): number`
  * Returns the page limit as a number (default: 100).
* `getPageNumber(page?: PageNumber): number`
  * Returns the page number as a number (default: 1).
* `pageToOffset(page?: PageNumber, limit?: PageLimit): number`
  * Converts a page number to an offset for pagination.
* `delete<T = any>(url: string, options: MutationOptions): Promise<AxiosResponse<T>>`
  * Sends a DELETE request. Supports `AxiosRequestConfig` and `onSuccess`/`onError` callbacks when a `queryCache` is provided on the agent.
* `get<T = any>(url: string, options: QueryOptions): Promise<AxiosResponse<T>>`
  * Sends a GET request. Supports `AxiosRequestConfig` and caching with `queryKey` (array or string), `expireIn`, and cache lifecycle options when a `queryCache` is provided on the agent.
    Present `queryKey` → its serialized value is the cache key. Omitted → URL is the cache key.
    `select` projects `response.data` for the current caller without changing the raw cached response.
    `ssrMode` and `ssrRevalitate` report hybrid SSR behavior to the active SSR tracker when rendering on the server.
    `toon: true` adds `text/toon` to the request `Accept` header; `text/toon` responses are decoded into JavaScript values with `@toon-format/toon`.
    Using these without `queryCache` will log a `console.error`.
* `patch<T = any>(url: string, data?: unknown, options: MutationOptions): Promise<AxiosResponse<T>>`
  * Sends a PATCH request.
* `post<T = any>(url: string, data?: unknown, options: MutationOptions): Promise<AxiosResponse<T>>`
  * Sends a POST request.
* `put<T = any>(url: string, data?: unknown, options: MutationOptions): Promise<AxiosResponse<T>>`
  * Sends a PUT request.
* `upload(url: string, data: FormData, onUploadProgress?: (e: AxiosProgressEvent) => void): Promise<AxiosResponse>`
  * Uploads a file using a POST request with `multipart/form-data` for file uploads.
* `download(url: string, fileName: string, domElement?: HTMLElement): Promise<AxiosResponse>`
  * Downloads a file using a GET request and triggers a download in the browser.

Cache
* Caching is enabled by passing a `queryCache` to `createApiAgent({ queryCache })` created via the [`createQueryCache`](#createquerycache) function. See [`createQueryCache`](#createquerycache) for cache keys, lifecycle behavior, invalidation, dehydration, and hydration.

**GET options** (passed to `agent.get` via `QueryOptions`):

| Option | Type | Behavior |
|--------|------|----------|
| `select` | `(data, response) => any` | Projects `response.data` for the current `agent.get` call. The cache stores the raw response; `onData` updates are projected with the same selector. |
| `toon` | `boolean` | Adds `text/toon` to the GET request `Accept` header. If the server responds with `content-type` containing `text/toon`, the response body is decoded with `@toon-format/toon`. |
| `fetchOnExpired` | `true \| string` | Replaces the former `callOnExpired`. `true` = passive (refetch on next `get` only if stale). `string` = active timer that auto-refetches when `expireIn` is exceeded. |
| `fetchOnInvalidate` | `true \| string` | After `invalidateQuery`, immediately refetch (`true`) or wait the duration string before refetching. |
| `removeOnExpired` | `boolean` | Remove the entry when `expireIn` is exceeded (instead of refetching). |
| `removeOnInvalidate` | `boolean` | Remove the entry immediately when invalidated. |
| `ssrMode` | `'auto' \| 'static' \| 'dynamic' \| 'no-store'` | Server-rendering mode for hybrid static/dynamic pages. `dynamic` and `no-store` mark the active SSR tracker dynamic. |
| `ssrRevalitate` | `string \| false` | Static page revalidation hint for SSR dependencies. Strings are converted to milliseconds with `stringToMs`; `false` disables time-based revalidation. |

```typescript
import { createApiAgent, createQueryCache } from '@pastweb/tools';

const queryCache = createQueryCache();
const agent = createApiAgent({ queryCache });

// Example API response:
// {
//   items: [{ id: 1, name: 'Ada' }],
//   meta: { total: 1 }
// }
const usersResponse = await agent.get('/api/users', {
  queryKey: ['users'],
  select: data => data.items,
});
console.log(usersResponse.data); // [{ id: 1, name: 'Ada' }]

// Another caller can reuse the same cache entry and select a different view.
const usersTotalResponse = await agent.get('/api/users', {
  queryKey: ['users'],
  select: data => data.meta.total,
});
console.log(usersTotalResponse.data); // 1

// Auto-refetch 1s after expiration window
await agent.get('/api/users', { expireIn: '5m', fetchOnExpired: '1s' });

// Passive: only refetch on next get if stale
await agent.get('/api/users', { expireIn: '5m', fetchOnExpired: true });

// Refetch immediately after invalidation
await agent.get('/api/users', { expireIn: '5m', fetchOnInvalidate: true });
queryCache.invalidateQuery('/api/users');

// Drop stale entries instead of refetching
await agent.get('/api/users', { expireIn: '5m', removeOnExpired: true });

// Request TOON and receive decoded JavaScript data when the server returns text/toon
await agent.get('/api/users', { toon: true });
```

Pagination
* When `pagination` is enabled, the `successResponseInterceptor` processes responses with a `Content-Range` header (e.g., `0-1/20` where `0-1` is start and end index adn `20` is the items total number).
For `application/json` responses contains the pagination additional info:
```typescript
{
  data: any, // Original response data
  pagination: {
    start: number, // Start index
    end: number, // End index
    total: number, // Total items
    size: number, // Page size
    current: number, // Current page
    of: number // Total pages
  }
}
```
The `Content-Range` header is parsed to extract `start`, `end`, and `total`. The `limit` query parameter (or `defaultPageLimit`) determines the page size.

**Example:**
```typescript
import { createApiAgent } from '@pastweb/tools';

const apiAgent = createApiAgent({
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  onGetValidToken: async () => ({ Authorization: 'Bearer newToken' }),
  onUnauthorizedResponse: () => {
    console.log('Unauthorized! Redirecting to login...');
  },
});

// Making a GET request
apiAgent.get('/api/data').then(response => {
  console.log('Data:', response.data);
});

// Uploading a file
const formData = new FormData();
formData.append('file', fileInput.files[0]);
apiAgent.upload('/api/upload', formData, (event) => {
  console.log('Upload progress:', Math.round((event.loaded * 100) / event.total));
});

// Downloading a file
apiAgent.download('/api/download', 'file.txt');

// Cached GET Request using structured queryKey (array) — the recommended form.
// The key stored in cache will be JSON.stringify(['users', 123]) i.e. '["users",123]'
const queryCache = createQueryCache();
const agent = createApiAgent({ queryCache });
await agent.get('/api/users/123', { queryKey: ['users', 123], expireIn: '5m' });
const same = await agent.get('/api/users/123', { queryKey: ['users', 123] }); // cache hit

// URL-only key (no queryKey) — cache key becomes the literal URL string
await agent.get('/api/users?status=active');

// Invalidate using the same queryKey shape you used when fetching (recommended)
queryCache.invalidateQuery(['users', 123]);

// Or using a URL key / prefix (still fully supported)
queryCache.invalidateQuery('/api/users');

// You can also pass the serialized string form if you prefer
queryCache.invalidateQuery(JSON.stringify(['users', 123]));


// Paginated GET Request
const agent = createApiAgent({ pagination: { defaultPageLimit: 10, header: 'Content-Range' } });
const response = await agent.get('/api/users?page=1&limit=10');
// Response: { data: [...], info: { start: 0, end: 9, total: 50, size: 10, current: 1, of: 5 } }
```
----

### `createQueryCache`

Creates a reusable `QueryCache` instance that can be passed to one or more `createApiAgent({ queryCache })` calls. Primarily useful to share cache state (and registered SSR prefetch functions) across agents, e.g. in SSR entry points for coordinated data collection before render.

> #### Syntax
```typescript
function createQueryCache(options?: CacheOptions): QueryCache
```

`CacheOptions`:
* `deHydratedScriptID?: string` _(default: `'__API_DEHYDRATED__'`)_ — DOM script id used by page-level query-cache hydration.
* `refetchOnWindowFocus?: boolean` _(default: `false`)_ — When `true` and running in a browser, re-runs every registered expiration `checker` in the cache when the window/tab regains focus.
* `refetchOnReconnect?: boolean` _(default: `false`)_ — When `true` and running in a browser, re-runs every registered expiration `checker` when the browser fires the `online` event.

The returned cache has:
- `getDehydrateScriptID()`: returns the DOM script id used for page-level dehydrated query-cache snapshots.
- `get(key)`: retrieves a cached response.
- `getAll()`: returns all cache entries.
- `has(key)`: checks if a key exists in the cache.
- `set(...)`: internal cache-aware GET writer used by `agent.get`.
- `delete(key)`: removes a cache entry.
- `invalidateQuery(key?)`: invalidates cache entries by key or prefix.
- `invalidateQueries(keys)`: invalidates multiple keys by delegating to `invalidateQuery`.
- `dehydrate()`: executes registered SSR prefetches, populates the cache, and returns a JSON snapshot.
- `hydrate(data)`: restores the cache from a JSON snapshot.
- `resetForSSR()`: clears in-memory entries and recall registrations before a server render cycle.

GET responses are stored under a key that is either:
- the serialized `queryKey` you provide (array recommended: `['users', id]`, or legacy string), or
- the full request URL when no `queryKey` is given.

Cache keys are either serialized `queryKey` values (when you pass `queryKey: [...]` to `agent.get` / `useQuery`) or raw URLs. `invalidateQuery` matches against whatever keys are stored and accepts the same value you passed as `queryKey` (string, array, or URL). Prefix rules apply to the final string keys. `invalidateQueries` accepts an array of keys and delegates to `invalidateQuery` for each one.

Cache entries expire based on the `expireIn` option (e.g., `'1s'`, `'5m'`) using the [`isDateYoungerOf`](#isdateyoungerof) utility. Using `expireIn` or `queryKey` without passing `queryCache` to the agent will log a console error.

`dehydrate()` executes any prefetch functions registered during SSR "dry runs", populates the cache, and returns a JSON string snapshot.

`hydrate(json)` can be used to restore the cache from a string previously returned by `dehydrate()`.

Example (SSR collection sketch):
```ts
import { createApiAgent, createQueryCache } from '@pastweb/tools';

const queryCache = createQueryCache();
const api = createApiAgent({ queryCache });
// ... later during collection pass, renders call useQuery which trigger agent.get that register
const snapshot = await queryCache.dehydrate();
// snapshot is JSON — write it to .pastweb/ssr-manifest.json etc.

queryCache.hydrate(savedSnapshot); // restore before real render
```

If your renderer embeds the dehydrated cache under a custom script id, configure the cache with the same id before hydration:

```ts
const queryCache = createQueryCache({
  deHydratedScriptID: '__MY_API_STATE__',
});

console.log(queryCache.getDehydrateScriptID()); // "__MY_API_STATE__"
```

Use `queryCache.resetForSSR()` at the start of each SSR request (or rely on `runSSRCycle`, which calls it automatically) to avoid cross-request cache leakage.

For partial hydration, use `sliceDehydratedState(snapshot, queryKeys)` to extract island-scoped cache JSON before client `hydrateRoot`.

See `AgentOptions.queryCache` and `QueryCache` for details. (`dehydrate()` is exposed on `QueryCache`.)

----

### `useQuery`

Creates a reactive query Object that fetches data using the provided function and updates based on reactive dependencies

> #### Syntax
```typescript
function useQuery<T>(config: QueryConfig<T>): QueryInfo<T>
```
Parameters
* `config: QueryConfig<T>` The configuration for the query.
  * `fn: () => Promise<AxiosResponse<T>>` The function to fetch data, typically an agent.get call from createApiAgent.
  * `source?: (() => any) | Ref<any> | Array<(() => any) | Ref<any>>` _(optional)_
    Reactive dependencies to track (e.g., `() => page.value`). Required if fn uses reactive variables in its URL or parameters.
  * `immediate?: boolean | Ref<boolean>` _(optional)_ (default: `true`)
    If `true` or a `Ref` with `value: true`, runs the query immediately. If a `Ref<boolean>`, triggers the query when `value` becomes `true`.
  * `initialData?: T` _(optional)_
    Initial data to set before the first fetch. Sets isPlaceholderData to true until a fetch completes.
  * `retry?: boolean | number | ((failureCount: number, error: unknown) => boolean)` _(optional)_ (default: `false`)
    Retries failed query executions. `true` retries up to 3 times, a number retries that many times, and a function decides per failure.
  * `retryDelay?: number | string | ((failureCount: number, error: unknown) => number)` _(optional)_ (default: `0`)
    Delay before each retry. Numbers are milliseconds, strings use `stringToMs` duration syntax such as `'1s'`, and functions return milliseconds.

Returns
* `QueryInfo<T>` A reactive object with query state and methods.
  * `status: 'pending' | 'success' | 'error'` Query lifecycle status.
  * `fetchStatus: 'idle' | 'fetching'` Transport activity status.
  * `responseStatus: number | null` HTTP status from the last successful response or Axios error response.
  * `data: T | null` The response data or `initialData`.
  * `pagination: Page<any>['pagination'] | null` Pagination info if available
  * `isPending: boolean` True while no successful real response has been received yet. A disabled query can be pending while idle.
  * `isLoading: boolean` True only during the first fetch (`status === 'pending' && fetchStatus === 'fetching'`).
  * `isFetching: boolean` True during any fetch.
  * `isError: boolean` True if an error occurred.
  * `error: any` The error object, if any.
  * `isPlaceholderData: boolean` True if `data` is `initialData`.
  * `fetch: () => Promise<void>` Manually triggers the query.

The `useQuery` function creates a reactive query that automatically fetches data when initialized (if `immediate` is `true`) or when reactive dependencies in `source` or `immediate` (if a `Ref`) change. It integrates with `createApiAgent` to handle reactive `AxiosResponse` objects, ensuring `data` updates with new responses or cache changes. The `source` parameter is required to track reactive variables used in `fn` (e.g., `page.value` in the `URL`).

When using `agent.get` inside `fn`, pass `select` in `QueryOptions` to project the response data for that query without changing the raw cached response. This is useful when an API returns wrapper objects but the consuming view only needs one nested value.

For SSR scenarios, create a `queryCache` via `createQueryCache()` and pass it as the `queryCache` option when creating agents (`createApiAgent({ queryCache })`). Agents and `useQuery` calls during a collection (dry) render will register prefetch functions. Call `dehydrate()` on the `queryCache` to execute the registered prefetches and obtain a JSON cache snapshot before the final render pass. See also `createQueryCache`.

The agent does not expose a cache property. Keep and use the `queryCache` reference directly for `dehydrate`, `hydrate`, and invalidation.

Example:
```typescript
import { createApiAgent, useQuery, ref } from '@pastweb/tools';

// Create an API agent with caching
const queryCache = createQueryCache();
const agent = createApiAgent({
  queryCache,
  pagination: true,
});

// Basic query with immediate fetch
const query = useQuery({
  fn: () => agent.get('/api/users?page=1&limit=10'),
});

console.log(query.data); // Initially null, updates to { data: [...], info: {...} }
console.log(query.isLoading); // true during the first fetch, then false
console.log(query.responseStatus); // HTTP status after a response, e.g. 200

// Query with reactive dependency
const page = ref(1);
const reactiveQuery = useQuery({
  fn: () => agent.get(`/api/users?page=${page.value}&limit=10`),
  source: page,
});

page.value = 2; // Triggers refetch with new URL

// Query with Ref<boolean> immediate
const immediate = ref(false);
const controlledQuery = useQuery({
  fn: () => agent.get('/api/users'),
  immediate,
});

immediate.value = true; // Triggers fetch

// With structured queryKey (recommended when using caching).
// The same key must be passed inside the agent.get call for the cache layer to use it.
// Internally the array is serialized (e.g. '["user",42]') and used as the storage key.
const userId = ref(42);
const userQuery = useQuery({
  fn: () => agent.get(`/api/users/${userId.value}`, {
    queryKey: ['user', userId.value],
    expireIn: '2m',
    select: data => data.user,
  }),
  source: userId,
});

// You can still omit queryKey entirely — the full URL (incl. querystring) becomes the cache key.
const listQuery = useQuery({
  fn: () => agent.get('/api/posts?published=true'),
  // cache key will be exactly "/api/posts?published=true"
});

// Retry failed requests. This retries twice after the first failed attempt.
const resilientUsersQuery = useQuery({
  fn: () => agent.get('/api/users', { queryKey: ['users'] }),
  retry: 2,
  retryDelay: 500,
});

// Retry can also be conditional.
const conditionalRetryQuery = useQuery({
  fn: () => agent.get('/api/admin'),
  retry: (failureCount, error: any) => {
    return failureCount < 2 && error?.response?.status !== 401;
  },
  retryDelay: '1s',
});

// Manual invalidation - pass the same queryKey you used (array or string/URL)
queryCache.invalidateQuery(['user', 42]);
```

---

### `useInfiniteQuery`

Creates a reactive infinite query for paginated or cursor-based lists.

> #### Syntax
```typescript
function useInfiniteQuery<TPage, TPageParam = unknown>(
  config: InfiniteQueryConfig<TPage, TPageParam>
): InfiniteQueryInfo<TPage, TPageParam>
```

Parameters
* `initialPageParam` The first page/cursor param.
* `fn(pageParam)` Fetches one page and returns an agent `QueryResponse`.
* `getNextPageParam` Optional function returning the next page param. Return `undefined`, `null`, or `false` to stop.
* `getPreviousPageParam` Optional function returning the previous page param. Return `undefined`, `null`, or `false` to stop.
* `source`, `immediate`, `initialData`, `retry`, `retryDelay` follow the same ideas as `useQuery`.

Returns
* `pages` / `data` Ordered page data.
* `pageParams` Params used for each page.
* `status`, `fetchStatus`, `responseStatus` Query lifecycle, transport, and HTTP status.
* `isPending`, `isLoading`, `isFetching`, `isFetchingNextPage`, `isFetchingPreviousPage`, `isError`.
* `hasNextPage` True when another page param is available.
* `hasPreviousPage` True when a previous page param is available.
* `fetch()` Resets to the first page.
* `fetchNextPage()` Appends the next page.
* `fetchPreviousPage()` Prepends the previous page.

Example:
```typescript
import { createApiAgent, useInfiniteQuery } from '@pastweb/tools';

const agent = createApiAgent({ pagination: true });

const posts = useInfiniteQuery({
  initialPageParam: 1,
  fn: page => agent.get(`/api/posts?page=${page}&limit=20`, {
    queryKey: ['posts', page],
  }),
});

await posts.fetchNextPage();
await posts.fetchPreviousPage();

console.log(posts.pages);
console.log(posts.hasNextPage);
console.log(posts.hasPreviousPage);
```

If page param resolvers are omitted, `useInfiniteQuery` uses the `pagination` object attached by `createApiAgent` when available. For cursor APIs, pass custom resolvers:

```typescript
const feed = useInfiniteQuery({
  initialPageParam: 'first',
  fn: cursor => agent.get(`/api/feed?cursor=${cursor}`),
  getNextPageParam: lastPage => lastPage.data.nextCursor,
  getPreviousPageParam: firstPage => firstPage.data.previousCursor,
});
```

---

### `useQueries`

Creates multiple `useQuery` instances and returns a reactive aggregate object.

> #### Syntax
```typescript
function useQueries<T extends readonly QueryConfig<any>[]>(config: { queries: T } | T): UseQueriesInfo<T>
```

Returns
* `queries` Child `QueryInfo` objects in input order.
* `data` Current child query data in input order.
* `status` Aggregate lifecycle status (`error` wins, then `pending`, then `success`).
* `fetchStatus` Aggregate fetch status (`fetching` if any child is fetching).
* `responseStatuses` Current child HTTP response statuses in input order.
* `isPending` True when at least one child query has not produced its first successful real response.
* `isLoading` True when at least one child query is loading its first response.
* `isFetching` True when at least one child query is fetching.
* `isError` True when at least one child query is in an error state.
* `errors` Current child query errors in input order.
* `isPlaceholderData` True when at least one child query is using placeholder data.
* `fetch()` Manually triggers all child queries.

Example:
```typescript
import { createApiAgent, ref, useQueries } from '@pastweb/tools';

const agent = createApiAgent();
const page = ref(1);

const dashboard = useQueries({
  queries: [
    {
      fn: () => agent.get('/api/users', {
        queryKey: ['users'],
        select: data => data.items,
      }),
      retry: 2,
    },
    {
      fn: () => agent.get(`/api/posts?page=${page.value}`, {
        queryKey: ['posts', page.value],
      }),
      source: page,
    },
  ],
});

console.log(dashboard.isFetching);
console.log(dashboard.data[0]); // users
console.log(dashboard.data[1]); // posts for current page

await dashboard.fetch(); // refetches all child queries
```

---

### `useMutation`

Creates a reactive mutation that executes the provided function and updates state with lifecycle hooks.

> #### Syntax
```typescript
function useMutation<T>(config: MutationConfig<T>): MutationInfo<T>
```

Parameters
* `config: MutationConfig<T>` The configuration for the mutation.
* `fn: (...args: any[]) => Promise<AxiosResponse<T>>` The mutation function, typically `agent.post`, `agent.put`, or `agent.delete` from `createApiAgent`.
* `onMutate?: (...args: any[]) => Promise<void> | void` _(optional)_ (default: `noop`)
  Called before the mutation executes, with the same arguments as `mutate`.
* `onSuccess?: (...args: any[]) => Promise<void> | void` _(optional)_ (default: `noop`)
  Called after a successful mutation or error in the `finally` block, with the same arguments as `mutate`.
* `onError?: (...args: any[]) => Promise<void> | void` _(optional)_ (default: `noop`)
  Called if the mutation fails, with the error object.
* `initialData?: T` _(optional)_ (default: `null`)
  Initial data to set before the first mutation. Sets `isPlaceholderData` to `true` until a mutation completes.
* `retry?: boolean | number | ((failureCount: number, error: unknown) => boolean)` _(optional)_ (default: `false`)
  Retries failed mutation executions. `true` retries up to 3 times, a number retries that many times, and a function decides per failure.
* `retryDelay?: number | string | ((failureCount: number, error: unknown) => number)` _(optional)_ (default: `0`)
  Delay before each retry. Numbers are milliseconds, strings use `stringToMs` duration syntax such as `'1s'`, and functions return milliseconds.

Returns
* `MutationInfo<T>` A reactive object with mutation state and methods.
* `data: T | null` The response `data` or `initialData`.
* `isPending: boolean` True during mutation execution.
* `isMutating: boolean` Alias for `isPending`.
* `isError: boolean` True if an error occurred.
* `error: any` The error object, if `any`.
* `isPlaceholderData: boolean` True if `data` is `initialData`.
* `mutate: (...args: any[]) => Promise<void>` Executes the mutation with provided arguments.

The `useMutation` function creates a reactive mutation object for operations like POST, PUT, or DELETE requests. It supports variadic arguments for `mutate` and `fn`, allowing flexible payloads. Lifecycle hooks (`onMutate`, `onSuccess`, `onError`) enable custom logic before and after mutations. The function integrates with `createApiAgent’s` reactive `AxiosResponse`, ensuring `data` updates with new responses or cache changes. Unlike `useQuery`, mutations are triggered manually via `mutate`, not reactively.

Example:
```typescript
import { createApiAgent, useMutation } from '@pastweb/tools';

// Create an API agent
const agent = createApiAgent({
  headers: { 'Content-Type': 'application/json' },
});

// Basic mutation
const mutation = useMutation({
  fn: (data: any) => agent.post('/api/users', data),
});

await mutation.mutate({ name: 'John' });
console.log(mutation.data); // { id: 1, name: 'John' }
console.log(mutation.isMutating); // false

// Mutation with lifecycle hooks
const createUser = useMutation({
  fn: (data: any) => agent.post('/api/users', data),
  onMutate: async (data) => {
    console.log('Starting mutation with:', data);
  },
  onSuccess: async (data) => {
    console.log('Mutation succeeded with:', data);
  },
  onError: async (error) => {
    console.error('Mutation failed:', error);
  },
});

await createUser.mutate({ name: 'Jane' });

// Mutation with retry support
const saveUser = useMutation({
  fn: (data: any) => agent.post('/api/users', data),
  retry: 2,
  retryDelay: 500,
});

await saveUser.mutate({ name: 'Grace' });

// Mutation with initialData
const updateUser = useMutation({
  fn: (data: any) => agent.put('/api/users/1', data),
  initialData: { id: 1, name: 'Placeholder' },
});

console.log(updateUser.data); // { id: 1, name: 'Placeholder' }
console.log(updateUser.isPlaceholderData); // true
await updateUser.mutate({ name: 'Updated' });
console.log(updateUser.isPlaceholderData); // false 
```
---

### `createAsyncStore`

Creates an asynchronous store with the given options.
Useful to be extended for async initialisation of application state manager like [redux](https://redux.js.org/) or [pinia](https://pinia.vuejs.org/) if needs to get initialisation data from async resources as [indexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).

For built-in micro-store patterns, see [`createMicroStore`](#createmicrostore) and [`createAsyncMicroStore`](#createasyncmicrostore).

> #### Syntax
```typescript
function createAsyncStore<T>(options: AsyncStoreOptions): T;
```

Parameters
* `options`: `AsyncStoreOptions`
  * The options for creating the asynchronous store.
  * `storeName`: `string`
    * The name of the store. This is required for better error debugging.
  * `timeout`: `number` (optional, default: 20000)
    * The timeout limit in milliseconds for initializing the store.

Returns
* `T`
  * The created asynchronous store.

Throws
* Will throw an error if the `storeName` option is not set.

**Example:**
```typescript
import { createAsyncStore } from '@pastweb/tools';

const storeOptions = {
  storeName: 'myStore',
  timeout: 30000,
};

const myStore = createAsyncStore(storeOptions);
```
---
### `normalizeAsyncQueue`

Normalizes an array of asynchronous operations into an array of promises.

> #### Syntax
```typescript
function normalizeAsyncQueue(wait: Wait | Wait[]): Promise<any>[];
```
Parameters
* `wait`: `Wait | Wait[]`
  * A single asynchronous operation or an array of asynchronous operations. Each operation can be:
    * A promise
    * A function that returns a promise
    * An object representing an asynchronous store

Returns
* `Promise<any>[]`
  * An array of promises.

Throws
* `Error`
  * Throws an error if an invalid type is encountered in the wait array.

**Example:**
```typescript
import { createAsyncStore, normalizeAsyncQueue } from '@pastweb/tools';
import type { AsyncStore } from '@pastweb/tools';

// Single promise
const singlePromise = Promise.resolve('done');
normalizeAsyncQueue(singlePromise); // [singlePromise]

// Array of promises and functions
const promise1 = Promise.resolve('done');
const promise2 = () => Promise.resolve('done');
normalizeAsyncQueue([promise1, promise2]); // [promise1, promise2()]

// Async store
const asyncStore = createAsyncStore<AsyncStore<any>>({
  name: 'UserSessionStore',
  async onInit() {
    await fetch('/api/session');
    asyncStore.setStoreReady();
  },
});

// Because asyncStore is not ready yet, normalizeAsyncQueue calls asyncStore.init()
// and returns asyncStore.isReady in the normalized promise list.
const queue = normalizeAsyncQueue([
  Promise.resolve('config-loaded'),
  () => fetch('/api/profile'),
  asyncStore,
]);

await Promise.all(queue);
console.log(asyncStore.isStoreReady); // true
```
Remarks
The `normalizeAsyncQueue` function is designed to handle various asynchronous operations and normalize them into a uniform array of promises. This is particularly useful when dealing with mixed asynchronous workflows, ensuring that all operations can be awaited in a consistent manner.

This function supports:
* Promises
* Functions returning promises
* Asynchronous stores

If an asynchronous store is passed in, the function will check if the store is ready. If it is not, the `init` method of the store will be called to prepare it.

## SSR utilities (experimental)

All SSR coordination helpers are experimental and grouped under `ssrUtils`:

```typescript
import {
  createSSRTracker,
  registerAsyncTask,
  resolveAsyncTasks,
  runSSRCycle,
} from '@pastweb/tools/ssrUtils';
```

---

### `registerAsyncTask` / `resolveAsyncTasks`

These helpers are designed so that code running during the initial (collection) render pass can declare async work that should happen afterwards. The resolution step uses an iterative loop so that work discovered while executing earlier tasks (e.g. from nested async components) is also handled.

> #### Syntax
```typescript
function registerAsyncTask(fn: () => Promise<any>): void;
async function resolveAsyncTasks(): Promise<void>;
```

`registerAsyncTask` only has effect on the server. The provided function is queued and will be executed when `resolveAsyncTasks` is called.

`resolveAsyncTasks` drains the queue iteratively. Any errors thrown by individual tasks are caught, logged, and do not prevent the remaining tasks from running.

**Example:**
```typescript
import { registerAsyncTask, resolveAsyncTasks } from '@pastweb/tools/ssrUtils';

// During a server-side collection / dry render
registerAsyncTask(async () => {
  const data = await fetchCriticalData();
  // side effects or store the result for later use
});

// Later, after the collection render
await resolveAsyncTasks();
```

This pattern is useful when you need to discover asynchronous work (such as data loading inside components) during render, then wait for it in a second phase without making the component function itself asynchronous.

`runSSRCycle` calls `resolveAsyncTasks` between two collection renders — see below.

---

### `runSSRCycle`

Framework-agnostic SSR orchestrator for SSR router and other SSR entry points. Runs the full collection → prefetch → render cycle with SSR tracker integration and hybrid static downgrade.

> #### Syntax
```typescript
function runSSRCycle(options: RunSSRCycleOptions): Promise<SSRCycleResult>
```

**Phase order:** collect #1 → `resolveAsyncTasks` → collect #2 → `dehydrate` → `hydrate` → final render → (optional) dynamic downgrade rerender.

**Key options:**
* `render` — async function receiving `{ isStatic, phase, apiDehydratedState }`.
* `queryCache` — shared cache; `resetForSSR()` runs before collection by default.
* `resolveAsyncTasks` — loads async components registered through `ssrUtils/asyncTasks` during collection.
* `shouldAttemptStatic` — pre-classify static intent; tracker may force downgrade.
* `onStaticProven` / `onDynamicDowngrade` — hooks for SSR router manifest writes.

**Example:**
```typescript
import { createQueryCache } from '@pastweb/tools';
import { runSSRCycle, resolveAsyncTasks } from '@pastweb/tools/ssrUtils';

const queryCache = createQueryCache();

const { html, snapshot, fingerprint, downgraded } = await runSSRCycle({
  route: '/shop',
  queryCache,
  resolveAsyncTasks,
  shouldAttemptStatic: true,
  render: async ({ isStatic, phase, apiDehydratedState }) => {
    return pageRender({ router, isStatic, phase, apiDehydratedState });
  },
  onStaticProven: ({ html, snapshot, fingerprint }) => {
    writeStaticHtml(html);
    persistManifest({ fingerprint, snapshot });
  },
});
```
---

### SSR tracker (`createSSRTracker`)

Standalone server-side tracker for hybrid render decisions. Installed during `runSSRCycle`; `agent.get({ ssrMode })` reports via `reportApiSSRToTracker`.

> #### Syntax
```typescript
function createSSRTracker(options?: SSRTrackerOptions): SSRTracker
function setCurrentSSRTracker(tracker?: SSRTracker): void
function getCurrentSSRTracker(): SSRTracker | undefined
function clearCurrentSSRTracker(): void
function reportApiSSRToTracker(url: string, options?: { queryKey?; ssrMode?; ssrRevalitate? }): void
function createDependencyFingerprint(snapshot: SSRTrackerSnapshot): string
```

`tracker.isStatic` exposes the current render mode selected by the SSR cycle.
`runSSRCycle` updates it before every phase, including the second render when a
static attempt is downgraded to dynamic output.

**`agent.get` SSR option (`ApiSSRMode`):** `'auto' | 'static' | 'dynamic' | 'no-store'`

```typescript
await agent.get('/api/posts', {
  queryKey: ['posts'],
  ssrMode: 'static',
  ssrRevalitate: '5m',
});
```

- `static` / `auto` → registers a static-safe API dependency on the tracker.
- `dynamic` / `no-store` → marks the render as dynamic (blocks static HTML persistence).

Use `createDependencyFingerprint(tracker.snapshot())` to key persisted `apiCache` entries in SSR router.

**Partial hydration:** combine `sliceDehydratedState(snapshot, islandQueryKeys)` with framework `Island` components — hydrate the slice before island `hydrateRoot`.

---
### `createAsyncMicroStore`

Create an async wrapper around [creteMicroStoreCollector](#createmicrostorecollector) with an `onInit` async function to pass into the options, in case your store/s need to be initialized with data from `async` resources as example `indexedDB`.

> #### Syntax
```typescript
function createAsyncMicroStore(options: MicroCollectorStoreOptions): MicroAsyncStore
```

Returns
* `MicroAsyncStore`
  * An object containing stores hooks to interact with the micro stores.

**Example:**
```typescript
import { createAsyncMicroStore } from '@pastweb/tools';
import { useCounterStore, useUserStore, useThemeStore } from '.../somewhere';

const useAsyncStores = createAsyncMicroStore({
  name: 'appStores',
  stores: [useCounterStore, useUserStore, useThemeStore],
  timeout: 15000,
  onInit: async (collectedStores) => {
    console.log('Initializing stores...', Object.keys(collectedStores));
    // Example: load user data after stores are collected
    await fetchInitialData(collectedStores.user);
  },
});

// Usage in app bootstrap
await useAsyncStores.init();

// Now safe to use stores
const counter = useAsyncStores.store.counter();
const user = useAsyncStores.store.user();

// Or wait for readiness
await useAsyncStores.isReady;
```

---

### `createEventEmitter`

Creates an event emitter that allows subscribing to events, emitting events, and removing event listeners.
It allows you to create a custom event system where you can emit events, subscribe to events with callback functions, and remove event listeners. Each listener is assigned a unique key, which is used to manage and remove listeners efficiently.

> #### Syntax
```typescript
function createEventEmitter(): EventEmitter;
```

Returns
* `EventEmitter`
  * An object containing methods to interact with the event emitter.

Methods
* `emit(eventName: string, ...args: any[]): void`
  * Emits an event, calling all subscribed event listeners with the provided arguments.
  * `eventName`: `string`
    * The name of the event to emit.
  * `...args`: `any[]`
    * Arguments to pass to the event listeners.

* `on(eventName: string, eventCallback: EventCallback): RemoveListener`
  * Subscribes an event listener to a specific event.
  * `eventName`: `string`
    * The name of the event to subscribe to.
  * `eventCallback`: `EventCallback`
    * The callback function to execute when the event is emitted.
  * Returns: `RemoveListener`
    * An object with a removeListener method to unsubscribe from the event.

* `removeListener(eventCallbackKey: symbol): void`
Removes an event listener using its unique key.
  * `eventCallbackKey`: `symbol`
    * The unique key for the event callback to remove.

**Example:**
```typescript
import { createEventEmitter } from '@pastweb/tools';

const emitter = createEventEmitter();
const listener = emitter.on('event', (data) => console.log(data));
emitter.emit('event', 'Hello, World!');
listener.removeListener();
```
---
### `createLangAsyncStore`

Creates a language asynchronous store with `i18next` integration for managing translations.
The `createLangAsyncStore` function provides a flexible way to manage multiple languages in your application using `i18next` with async initialisation, in case ,as example you need to initialise the store getting or setting data to an async resource [indexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).
It supports:

* Initialization with an initial language.
* Dynamic support for multiple languages.
* Integration with translation resources.
* Custom plugins for `i18next`.
The store is asynchronous and ensures that the language settings and resources are ready before allowing operations like language switching. It is designed to work seamlessly with both synchronous and asynchronous workflows.

> #### Syntax
```typescript
function createLangAsyncStore(options: LangOptions): LangAsyncStore;
```
Parameters
* `options`: `LangOptions`
  * Configuration options for the language store. This includes initial language settings, supported languages, translation resources, and additional `i18next` options.

Returns
* `LangAsyncStore`
  * The created language store, which integrates i18next and provides methods for managing translations and changing the language.

Methods and Properties
* `store.i18n`: `i18n`
  * The `i18next` instance used for managing translations.
* `store.supported`: `string[] | Promise<string[]>`
  * An array of supported languages. If an asynchronous function is provided, it returns a promise that resolves with the supported languages.
* `store.current`: `Promise<string>`
  * A promise that resolves with the current language.
* `store.t`: `TFunction`
  * A translation function provided by i18next.

* `store.changeLanguage(lng: string | undefined, callback?: Callback): Promise<TFunction<'translation', undefined>>`
  * Changes the current language of the store and triggers any specified callback or the store's `onLangChange` function.

  * `lng`: `string | undefined`
    * The language code to switch to.

  * `callback`: `Callback`
    * An optional callback function that is called after the language is changed.

  * Returns: `Promise<TFunction<'translation', undefined>>`
    * A promise that resolves with the `i18next` translation function after the language is changed.

**Example:**
```bash
$ npm i -S i18next
```
```typescript
import { createLangAsyncStore } from '@pastweb/tools/createLangAsyncStore';

const langStore = createLangAsyncStore({
  initLang: 'en',
  supported: ['en', 'fr', 'es'],
  translations: { en: { translation: { key: 'value' } } },
  i18n: { fallbackLng: 'en' },
});

langStore.changeLanguage('fr').then((t) => {
  console.log(t('key')); // Outputs the translation for 'key' in French
});
```

---

### `createMatchSchemeAsyncStore`

Creates an asynchronous store for managing color schemes.
This function initializes an asynchronous store specifically for handling color scheme preferences and system theme detection.
It integrates with [`createMatchScheme`](#creatematchscheme) to track and manage color mode changes.

> #### Syntax
```typescript
function createMatchSchemeAsyncStore(options?: SchemeOptionsAsyncStore): ColorSchemeAsyncStore;
```

Parameters
* `options`: `SchemeOptionsAsyncStore` _(optional)_
  * Configuration options for the asynchronous store.

| Property       | Type                  | Default              | Description |
|---------------|-----------------------|----------------------|-------------|
| `storeName`   | `string`               | `"ColorSchemeStore"` | The name of the store. |
| `datasetName` | `string \| false`      | `false`              | The dataset attribute name for storing the color scheme. If `false`, it uses CSS class names instead. |
| `defaultMode` | `string`               | `"auto"`             | The default mode (`'auto'`, `'light'`, or `'dark'`). |
| `initStore`   | `(matchScheme: MatchScheme) => Promise<void>` | `noop` | An asynchronous function that runs during store initialization. |

Returns
* `ColorSchemeAsyncStore`
  * An object that provides methods and properties for managing color schemes asynchronously.

Properties
* `matchScheme`: `MatchScheme`
  * Manages color scheme detection and provides methods to get or change the scheme.
* `init(): void`
  * A no-op initialization function.
* `setStoreReady(): void`
  * Marks the store as ready after initialization.

**Example:**
```typescript
import { createMatchSchemeAsyncStore } from '@pastweb/tools';

const colorSchemeStore = createMatchSchemeAsyncStore({
  defaultMode: 'auto',
  datasetName: 'theme',
  initStore: async (matchScheme) => {
    console.log('Initializing with:', matchScheme.getInfo());
  }
});
```

---

### `debounce`
Creates a debounced function that delays invoking `fn` until after `timeout` milliseconds have elapsed since the last time the debounced function was invoked.
The debounced function includes methods `cancel` and `flush` to cancel delayed invocation and to immediately invoke them, respectively.

> #### Syntax
```typescript
function debounce(fn: DebouceCallback, timeout?: number): DebouceCallback;
```
Parameters
* `fn`: `DebouceCallback`
  * The function to debounce.
* `timeout`: `number` _(optional, default: 300)_
  * The number of milliseconds to delay.

Returns
* `DebouceCallback`

**Example:**
```typescript
import { debounce } from '@pastweb/tools';

const debouncedLog = debounce((msg: string) => console.log(msg), 500);

debouncedLog('Hello');  // Will log 'Hello' after 500 milliseconds if not called again within this time.
debouncedLog.cancel();  // Cancels the delayed invocation.
debouncedLog.flush();   // Immediately invokes the delayed function.
```
---

### `throttle`

Returns a throttle function defined in the `fn` parameter, which is executed for each `timeout` passed as the second parameter. The returned throttle function includes two members:

- **`cancel`**: A function to stop the throttling of the function.
- **`flush`**: A function to flush the timeout.

> #### Syntax
```typescript
function throttle(fn: ThrottleCallback, timeout?: number): ThrottleCallback;
```
Parameters
* `fn`: `ThrottleCallback`
  * The function to run.
* `timeout`: `number` _(optional, default: 300)_
  * The timeout gap in milliseconds.

Returns
* `ThrottleCallback`
  * The throttle callback function.

**Example:**
```typescript
import { throttle } from '@pastweb/tools';

const throttledLog = throttle((msg: string) => console.log(msg), 500);

throttledLog('Hello');  // Will log 'Hello' immediately.
throttledLog('World');  // Will not log 'World' if called within 500 milliseconds.
throttledLog.cancel();  // Cancels the throttling.
throttledLog.flush();   // Flushes the timeout, allowing the function to be invoked immediately.
```
---

## Browser functions

### `createMatchDevice`

Creates a utility for detecting and managing device types based on user agent strings and media queries.
The `createMatchDevice` function is designed to help detect device types based on user agent strings and media queries. This utility is particularly useful for responsive design and ensuring that your application behaves differently depending on the device being used.

* Device Detection: The utility supports both user agent string matching and media query matching to determine device types.
* Server-Side Rendering (SSR): If server-side rendering is detected user agent-based detection is used, and media query-based detection is skipped.
* Dynamic Updates: The utility can respond to changes in media query matches, allowing dynamic updates to the device state.
* Event Emitter: The underlying event emitter allows you to listen for specific device match changes, enabling reactive design and behavior changes.

> #### Syntax
```typescript
function createMatchDevice(config: DevicesConfig = {}): MatchDevice;
```
Parameters
* `config`: `DevicesConfig` 
  * An optional configuration object that maps device names to their detection criteria. Each device's configuration can include a user agent test and/or a media query.

Returns
* `MatchDevice`
  * An object with methods for getting the current matched devices, setting change listeners, and listening for specific device match events.

Methods
* `getDevices(): MatchDevicesResult`
  * Returns an object representing the current state of device matches. Each key in the object corresponds to a device name, and the value is a boolean indicating whether the device matches the criteria.

* `onChange(fn: (devices: MatchDevicesResult) => void): void`
  * Sets a callback function to be executed whenever the device match state changes. The callback receives an updated MatchDevicesResult object.
  * `fn: (devices: MatchDevicesResult) => void`
    * The callback function to be called on device state change.

* `onMatch(isDeviceName: string, fn: (result: boolean, deviceName: string) => void): void`
  * Sets a listener for a specific device match event. The callback is triggered whenever the specified device's match state changes.
  * `deviceName`: `string`
    * The name of the device to listen for.
  * `fn`: `(result: boolean, isDeviceName: string) => void`
    * The callback function to be called when the device match event occurs.

**Example:**
```typescript
import { createMatchDevice } from '@pastweb/tools';

const deviceConfig = {
  mobile: {
    userAgent: /Mobile|Android/i,
    mediaQuery: '(max-width: 767px)',
  },
  tablet: {
    mediaQuery: '(min-width: 768px) and (max-width: 1024px)',
  },
};

const matchDevice = createMatchDevice(deviceConfig);

matchDevice.onChange((devices) => {
  console.log('Device states updated:', devices);
});

matchDevice.onMatch('mobile', (deviceName) => {
  console.log('Mobile device match changed:', deviceName);
});

const currentDevices = matchDevice.getDevices();
console.log('Current matched devices:', currentDevices);
```
---

### `createMatchScheme`

Creates a match scheme manager that allows setting and tracking the color scheme mode.  
It detects system preferences, provides methods to update the mode, and notifies listeners of changes.

> #### Syntax 
```ts
function createMatchScheme(options?: SchemeOptions): MatchScheme;
```

## Parameters  

### `options` (optional)  
**Type:** `SchemeOptions`  
An object containing configuration options for the match scheme.

| Property       | Type      | Default  | Description |
|---------------|----------|----------|-------------|
| `defaultMode` | `string` | `"auto"` | The initial color mode: `'auto'`, `'light'`, or `'dark'`. |
| `datasetName` | `string \| false` | `false` | The dataset attribute name used to store the color scheme in the root element. If `false`, it uses CSS class names instead. |

## Returns  

* `MatchScheme`
  * An object with methods to manage and listen to scheme changes.

## Methods  

* `scheme.getInfo(): { mode: string; system: string; selected: string }`
  * Retrieves the current color scheme information.
  * Returns:

| Property   | Type   | Description |
|------------|--------|-------------|
| `mode`     | `string` | The currently set mode (`'auto'`, `'light'`, or `'dark'`). |
| `system`   | `string` | The system's detected color scheme (`'light'` or `'dark'`). |
| `selected` | `string` | The active mode (either `mode` or the detected system scheme if `mode` is `'auto'`). |

* `scheme.setMode(mode: string): void`
  * Updates the color mode. If `'auto'` is selected, the mode will follow the system's preference.
  * Parameters:

| Name   | Type   | Description |
|--------|--------|-------------|
| `mode` | `string` | The new mode: `'auto'`, `'light'`, or `'dark'`. |

* `scheme.onModeChange(fn: (mode: string) => void): void`
  * Registers a callback that is triggered when the mode changes.
  * Parameters:

| Name | Type | Description |
|------|------|-------------|
| `fn` | `(mode: string) => void` | A callback function that receives the new mode. |

* `scheme.onSysSchemeChange(fn: (mode: string) => void): void`
  * Registers a callback that triggers when the system's preferred color scheme changes.
  * Parameters:

| Name | Type | Description |
|------|------|-------------|
| `fn` | `(mode: string) => void` | A callback function that receives the new system scheme (`'light'` or `'dark'`). |

**Example:**
```typescript
import { createMatchScheme } from '@pastweb/tools';

const scheme = createMatchScheme({ defaultMode: 'auto', datasetName: 'theme' });

console.log(scheme.getInfo()); 
// { mode: 'auto', system: 'dark', selected: 'dark' }

scheme.onModeChange((mode) => {
  console.log(`Color mode changed to: ${mode}`);
});

scheme.setMode('light');
// Logs: "Color mode changed to: light"
```

---

### `useColorScheme`

Hook that returns a reactive color-scheme info object and a setter function.
It uses the library's reactivity primitives so the info stays up-to-date when the scheme changes.
If `matchScheme` is provided it is used directly; otherwise `createMatchScheme(options)` is called internally.

> #### Syntax
```typescript
function useColorScheme(options?: SchemeOptions, matchScheme?: MatchScheme): [ColorSchemeInfo, (mode: string) => void];
```

Parameters
* `options`: `SchemeOptions` _(optional)_
  * Same options as [`createMatchScheme`](#creatematchscheme). Used only when no `matchScheme` is passed.
* `matchScheme`: `MatchScheme` _(optional)_
  * An existing `MatchScheme` instance. If omitted, one is created internally.

Returns
* `[ColorSchemeInfo, (mode: string) => void]`
  * A tuple where the first element is a reactive `ColorSchemeInfo` and the second element is the `setMode` function delegated to the underlying scheme.

**Example:**
```typescript
import { effect, useColorScheme } from '@pastweb/tools';

const [scheme, setMode] = useColorScheme({ defaultMode: 'auto' });

effect(() => {
  console.log('Selected color scheme:', scheme.selected);
});

setMode('dark');
// scheme.selected will now be 'dark' (and effects re-run)
```

---

### `createStorage`

Creates a versatile storage utility that supports both IndexedDB and localStorage.
This utility allows for custom storage handling, default settings, and hooks for various operations.

> #### Syntax
```typescript
function createStorage(config: StorageConfig = {}): Storage;
```

Parameters
* `config`: `StorageConfig`
  * An object containing configuration options for the storage utility. The available options include:
  * `dbName`: `string` _(optional)_
    * The name of the database when using IndexedDB. Default is 'storage'.
  * `storeName`: `string` _(optional)_
    * The name of the object store within the database when using IndexedDB. Default is 'storage'.
  * `type`: `'indexedDB' | 'localStorage'` _(optional)_
    * The type of storage to use. Defaults to 'indexedDB' if supported; otherwise, it falls back to 'localStorage'.
  * `defaultSettings`: `Record<string, any>` _(optional)_
    * An object representing default settings to be applied when the store is first created.
  * `onSet`: `Record<string, (storage: Storage, value: any, store: boolean) => Promise<any>>` _(optional)_
    * Hooks to run custom logic when a value is set in the store.
  * `onGet`: `Record<string, (storage: Storage, value: any) => Promise<any>>` _(optional)_
    * Hooks to run custom logic when a value is retrieved from the store.
  * `onRemove`: `Record<string, (storage: Storage, path: string, justLocalStorage: boolean) => Promise<void>>` _(optional)_
    * Hooks to run custom logic when a value is removed from the store.

Returns
* `Storage`
  * An object with methods for interacting with the storage, including getting, setting, and removing data.

Methods
* `storage.get(path: string): Promise<any>`
Retrieves a value from the storage.
  * `path`: `string`
    * The path to the value in the storage.
  * Returns: `Promise<any>`
    * A promise that resolves to the stored value.

* `storage.set(path: string, value: any, store = false): Promise<void>`
Sets a value in the storage.
  * `path`: `string`
    * The path to store the value at.
  * `value`: `any`
    * The value to store.
  * `store`: `boolean` (optional)
    * Whether to store the value in the underlying storage (e.g., IndexedDB or localStorage). Default is false.
  * Returns: `Promise<void>`
    * A promise that resolves once the value is set.

* `storage.remove(path: string, justLocalStorage = false): Promise<void>`
Removes a value from the storage.
  * `path`: `string`
    * The path to remove.
  * `justLocalStorage`: `boolean` (optional)
    * Whether to only remove the value from local storage. Default is false.
  * Returns: `Promise<void>`
    * A promise that resolves once the value is removed.

* `storage.isStored(path: string): boolean`
Checks if a specific path is stored in the storage.
  * `path`: `string`
    * The path to check.
  * Returns: `boolean`
    * True if the path is stored, false otherwise.

* `storage.isStoreReady: Promise<true>`
  * A promise that resolves when the storage is fully initialized and ready to be used.

**Example:**
```typescript
import { } from '@pastweb/tools';

const storage = createStorage({
  dbName: 'myDatabase',
  storeName: 'myStore',
  type: 'indexedDB',
  defaultSettings: { theme: 'dark' },
 });
 
 // Set a value in storage
 await storage.set('theme', 'light');
 
 // Get a value from storage
 const theme = await storage.get('theme');
 
 // Remove a value from storage
 await storage.remove('theme');
```
---
## Date and Time

### `isDateYoungerOf`

The `isDateYoungerOf` function checks whether a given date is younger (i.e., more recent) than a specified duration.
The duration is provided as a string composed of multiple time components such as years, months, days, hours, minutes, and seconds.

> #### Syntax
```typescript
function isDateYoungerOf(date: Date, duration: string): boolean;
```

Parameters
* `date`: `Date`
  * The date object to be checked against the specified duration.
* `duration`: `string`
  * A string representing the duration composed of various time units:
    * `Y` for years
    * `M` for months
    * `D` for days
    * `h` for hours
    * `m` for minutes
    * `s` for seconds
* The string can contain multiple components, e.g., `"2Y3M1D"` for 2 years, 3 months, and 1 day.

Returns
* `boolean`:
  * Returns `true` if the given date is strictly younger than the specified duration relative to the current date and time. Returns `false` otherwise.

**Example:**
```typescript
import { isDateYoungerOf } from '@pastweb/tools';

const date = new Date();
date.setHours(date.getHours() - 12); // 12 hours ago
console.log(isDateYoungerOf(date, '1D')); // Output: true
console.log(isDateYoungerOf(date, '2D')); // Output: true
console.log(isDateYoungerOf(date, '12h')); // Output: false
```

Edge Cases
* `Past and Future Dates`: The function checks the date against the current date and time, so it works for both past and future dates relative to `now`.
* `Zero or Negative Durations`: If the duration components result in zero or negative values, the function will consider the date as not younger and will return `false`.

---

### `stringToMs`

The `stringToMs` function converts a duration string into milliseconds.
It accepts the same unit format as [`isDateYoungerOf`](#isdateyoungerof), making it useful for timers, cache delays, and any logic that needs a numeric duration rather than a date comparison.

> #### Syntax
```typescript
function stringToMs(duration: string): number;
```

Parameters
* `duration`: `string`
  * A string representing the duration composed of various time units:
    * `Y` for years (average: 365.25 days)
    * `M` for months (average: 30.436875 days)
    * `D` for days
    * `h` for hours (case-insensitive)
    * `m` for minutes
    * `s` for seconds
  * Components can appear in any order and be combined, e.g. `"2Y3M1D2h30m45s"` or `"5m"`.

Returns
* `number`:
  * The total duration in milliseconds. The result is floored to an integer. Returns `0` for empty, whitespace-only, or unparseable strings.

**Example:**
```typescript
import { stringToMs } from '@pastweb/tools';

console.log(stringToMs('1s'));              // 1000
console.log(stringToMs('5m'));              // 300000
console.log(stringToMs('1D'));              // 86400000
console.log(stringToMs('2Y3M1D2h30m45s'));  // combined total in ms
console.log(stringToMs(''));                // 0
```

Notes
* `Month vs minute`: Uppercase `M` means months; lowercase `m` means minutes (e.g. `"1M30m"` is one month plus thirty minutes).
* `Case sensitivity`: Only hours (`h`) are matched case-insensitively; other units use fixed letter casing as listed above.
* `Repeated components`: The parser sums every matched segment, so `"1h1h"` is treated as two hours.

Use Cases
* `Cache and polling delays`: Convert `expireIn`-style strings (e.g. `'5m'`, `'1s'`) into millisecond values for `setTimeout` or scheduling logic.
* `Timers and debouncing`: Turn human-readable duration strings into numeric delays for async workflows.

---

## Element functions

### `cl`

Combines class names using the `clsx` library.

> #### Syntax
```typescript
function cl(...args: ClassValue[]): string;
```
Parameters
* `...args`: `ClassValue[]`
  * A list of class values to combine. Each ClassValue can be a string, an object, or an array.

Returns
* `string`
  * The combined class names as a single string.

**Example:**
```typescript
import { cl } from '@pastweb/tools';

const classNames = cl('btn', { 'btn-primary': true }, 'extra-class');
// Output: 'btn btn-primary extra-class'
```
Methods
* `cl.setClasses`
  * Sets custom CSS module classes and returns a function to combine class names with these classes.
  
> #### Syntax
```typescript
cl.setClasses(classes: CSSModuleClasses | CSSModuleClasses[], mode: 'merge' | 'replace' = 'merge'): (...args: ClassValue[]) => string;
```

Parameters
* `classes`: `CSSModuleClasses | CSSModuleClasses[]`
  * An object or array of objects representing CSS module classes to use for mapping class names.

* `mode`: `'merge' | 'replace'` _(optional)_
The mode for combining classes:
  * `'merge'`: Combines the custom classes with the existing classes.
  * `'replace'`: Replaces existing class names with the custom classes.

Returns
* `(...args: ClassValue[]) => string`
A function that takes class values as arguments and returns the combined class names as a string.

Throws
* `Error`
Throws an error if a provided class object is not a valid object.

The `setClasses` method returns a function which it works as the `cl` function, but returns the scoped classes presents in the CSS Module if present or the `class string` itself if not.

**Example:**
```typescript
import { cl } from '@pastweb/tools';

const cssModules = {
  'btn': 'btn_hash',
  'btn-primary': 'btn-primary_hash',
};

const cls = cl.setClasses(cssModules);
const classNames = cls('btn', 'btn-primary', 'some-other-class');
// Output: 'btn_hash btn-primary_hash some-other-class'
```

It is possible combine the classes of multiple CSS Modules:

**Example:**
```typescript
import { cl } from '@pastweb/tools';

const cssModules1 = {
  'btn': 'btn_hash1',
  'btn-primary': 'btn-primary_hash1',
};

const cssModules2 = {
  'btn-primary': 'btn-primary_hash2',
};

const clsMerge = cl.setClasses([ cssModules1, cssModules2 ], 'merge' /** you can omit the second parameter as it is 'merge' by default */);
const classNames = clsMerge('btn', 'btn-primary');
// Output: 'btn_hash1 btn-primary_hash1 btn-primary_hash2'

const clsReplace = cl.setClasses([ cssModules1, cssModules2 ], 'replace');
const replacedClassNames = clsReplace('btn', 'btn-primary');
// Output: 'btn_hash1 btn-primary_hash2'
```

Or is it possible make a composition with different `ClassProcessor`.
Key Features:

1. Type Definition: Added `ClassProcessor` interface to define the shape of our function with both the call signature and `setClasses` method.
2. Composable setClasses: Each setClasses call:
  * Creates a new processor function
  * Maintains its own classes and mode
  * Returns a new function with its own setClasses method
  * Concatenates classes when composing

**Example:**
```typescript
import { cl } from '@pastweb/tools';
// Basic usage
cl('btn', 'active'); // 'btn active'

// Single module
const module1 = { btn: 'btn_123', active: 'active_456' };
const cl1 = cl.setClasses(module1);
cl1('btn', 'active'); // 'btn_123 active_456'

// Multiple modules composition
const module2 = { btn: 'btn_789', hover: 'hover_abc' };
const cl2 = cl1.setClasses(module2);
cl2('btn', 'hover'); // 'btn_123 btn_789 hover_abc'

// Different modes
const cl3 = cl2.setClasses({ btn: 'btn_xyz' }, 'replace');
cl3('btn', 'active'); // 'btn_xyz active_456'

// Each instance remains independent
cl('btn');     // 'btn'
cl1('btn');    // 'btn_123'
cl2('btn');    // 'btn_123 btn_789'
cl3('btn');    // 'btn_xyz'

// Example CSS modules
const module1 = { foo: 'foo_1', bar: 'bar_1' };
const module2 = { foo: 'foo_2', baz: 'baz_2' };
const module3 = { bar: 'bar_3' };

// Chained setClasses calls
const cx = cl
  .setClasses(module1, 'merge')        // First set of classes
  .setClasses(module2, 'replace')      // Override with second set
  .setClasses(module3, 'merge');       // Add third set

// Usage
console.log(cx('foo', 'bar', 'baz')); 
// Output depends on final composition, likely "foo_2 bar_3 baz_2"
```

Benefits:

1. Chainable: You can keep adding modules with .setClasses().
2. Immutable: Each call creates a new processor without modifying previous ones.
3. Flexible: Maintains mode control at each composition level.
4. Type-safe: TypeScript will properly infer types throughout the chain.

Performance Benefits:

1. Frequent calls with the same arguments will return cached results.
2. Each processor instance maintains its own cache.
3. Reduces computation for repeated class combinations.

---
### `createEntry`
Creates an entry object with event emitter capabilities and various utility methods to be extended for a specific frontend framework.

An Entry is the shorthend for Entrypoint, to be intended (in this case) as Javascript entrypoint and the DOM mount element where the Javascript Framework should apply its effect.
The `createEntry` function gives an high level interface to other frameworks for implement the `mount`, `unmount` and `update` methods with some additional support for the `SSR`.
For the `SSR` process, because the `Entries` could be nested, as example for a framework migration process, and considering different frameworks could have a `sync` or `async` function
for the Server Side Rendering, the `Entry` object has other 2 methos to solve this problem.

* `memoSSR(htmlPromiseFunction: () => Promise<string>): void;`
  * This method must be used inside the `mount` method and memorise the `HTML` string produced from the `SSR` framework function, returning a unique `ssrId`.
* `getComposedSSR(): Promise<string>`
  * Is an `async` function wich compose the final `HTML` string replacing the `sseId` with the previous memorised `HTML` for each `Entry` Object.


> #### Syntax
```typescript
function createEntry<E extends Entry<O>, O extends EntryOptions>(options?: O): E;
```

Parameters
* `options`: O
Options configuration for the entry. The options are of type `EntryOptions` and may include the following properties:
  * `EntryComponent`: `any` _(optional)_
    * The component to be set as the entry component.
  * `entryElement`: `HTMLElement` _(optional)_
    * The HTML element that represents the entry point in the DOM.
  * `querySelector`: `string` _(optional)_
    * A CSS selector string that can be used to find the entry element within the DOM.
  * `initData`: `Record<string, any>` _(optional)_
    * An object containing initial data to be passed into the entry during its creation.

Returns
* `E`
  * The created entry object, which includes event emitter functionalities and various utility methods.

Methods
The entry object returned by createEntry includes the following methods:

* `entry.memoSSR(htmlPromiseFunction: () => Promise<string>): void;`: Stores the SSR HTML promise function.
  - `htmlPromiseFunction`: `() => Promise<string>`: The function that returns an HTML promise.
* `entry.getComposedSSR(): Promise<string>`: Composes the SSR HTML from the stored promises.
  - Returns: `Promise<string>`: The composed SSR HTML.
* `entry.setEntryElement(entryElement: HTMLElement): void;`: Sets the entry element.
* `entry.setQuerySelector(querySelector: string): void;`: Sets the query selector.
* `entry.setOptions(options: O): void;`: Sets the options for the entry.
* `entry.mergeOptions(options: O): void;`: Merges the options for the entry.
* `entry.setEntryComponent(Component: any): void;`: Sets the entry component.

Events
The entry object also has event emitter capabilities with the following methods:

* `on`: Registers an event listener.
* `emit`: Emits an event.
* `removeListener`: Removes an event listener.

the events used to handle the entry are:
* `mount`: called when the entry must be mounted to the DOM.
* `update`: called when the some data in the entry nust be updated.
* `unmount`: called when the entry must be unmounted from the DOM.

**Example>**
```typescript
import { createEntry } from '@pastweb/tools';

const entry = createEntry({
  EntryComponent: MyComponent,
  entryElement: document.getElementById('app'),
  querySelector: '#app',
  initData: { key: 'value' },
});

// Usage of the entry object
entry.on('someEvent', () => console.log('Event triggered'));
entry.emit('someEvent');
```
---

### `createPortal`

Creates a Portal object that manages the lifecycle of portal entries, including opening, updating, and closing portal instances.
Portal is a common term used to identify a mechanism usually implemented in a Front End framework for render and handle components in a not nested
DOM element a good example is a rendering of a modal window you can see an example implementation for [react](https://react.dev/reference/react-dom/createPortal), [vue](https://vuejs.org/guide/built-ins/teleport) or [angualr](https://material.angular.io/cdk/portal/overview).
This function abstract the mechanism in order to have a consistant api cross Frameworks useing the [Entry](#createentry) object.

> #### Syntax
```typescript
function createPortal(
  entry: (props: Record<string, any>, component: any) => Entry<any>,
  defaults?: Record<string, any>
): Portal;
```

Parameters
* `entry`: `((props: Record<string, any>, component: any) => Entry<any>)`
  * A function that takes props and a component, returning an Entry object that represents the portal entry. This function defines how the portal entry is created.
* `defaults`: `Record<string, any>` _(optional)_
  * An optional object containing default properties that will be merged with the props when creating a portal entry. This allows for setting default behavior or configuration for the portal.

Returns
* `Portal`
An object that provides methods for managing portal entries, such as opening, updating, closing, and removing them.

**Example:**
```typescript
import { createPortal } from '@pastweb/tools';
import { MyComponent } from './MyComponent';

const myPortal = createPortal((props, component) => new MyComponent(props), { defaultProp: 'defaultValue' });

const portalId = myPortal.open(MyComponent, { prop1: 'value1' });
myPortal.update(portalId, { prop1: 'newValue' });
myPortal.close(portalId);
myPortal.remove(portalId);
```
Methods of Portal
The returned Portal object contains several methods for managing portal instances:

* `open(component: any, props?: Record<string, any>, defaults?: Record<string, any>): string | false`
  * Opens a new portal entry with the specified component and props. Returns the entry ID if successful, or false if the portal could not be opened.
* `update(entryId: string, entryData?: any): boolean`
  * Updates an existing portal entry with the given entry ID and new data. Returns true if the update was successful, or false otherwise.
* `close(entryId: string): void`
  * Closes the portal entry associated with the given entry ID.
* `remove(entryId: string): boolean`
  * Removes the portal entry associated with the given entry ID from the portals cache. Returns true if the removal was successful, or false otherwise.
* `setIdCache(newCache: any): void`
  * Sets a new cache for managing entry IDs within the portal.
* `setPortalElement(newElement: HTMLElement | (() => HTMLElement)): void`
  * Sets a new portal element or a function that returns the portal element, which is used for rendering the portal's content.
* `setPortalsCache(newPortals: any): void`
  * Replaces the current portals cache with a new one.
* `setOnRemove(fn: (entryId: string) => void): void`
  * Sets a callback function that will be called whenever a portal entry is removed.

**Example with Custom Configuration:**
```typescript
import { createPortal } from '@pastweb/tools';
import { CustomComponent } from './CustomComponent';

const customPortal = createPortal((props, component) => new CustomComponent(props), { color: 'blue' });

const entryId = customPortal.open(CustomComponent, { size: 'large' });
customPortal.setOnRemove(id => console.log(`Removed portal entry with ID: ${id}`));
customPortal.close(entryId);
```
In this example, a custom portal is created, opened with specific props, and then closed. The `setOnRemove` method is used to log a message whenever a portal entry is removed.

---

### `anchorsSetup`

Sets up a structure of portals based on provided anchor IDs, descriptors, and configurations. This function is designed to initialize a tree of portal functions that can manage portal entries across different elements identified by their IDs.

> #### Syntax
```typescript
function anchorsSetup(
  anchors: PortalAnchorsIds,
  descriptor: EntryDescriptor,
  getEntry: (...args: any[]) => any,
  idCache: IdCache,
  portalsCache: Portals
): PortalsDescriptor;
```

Parameters
* `anchors`: `PortalAnchorsIds`
  * An object mapping anchor IDs to their corresponding portal functions. This structure can be nested to represent hierarchical relationships between different portal anchors.
* `descriptor`: `EntryDescriptor`
  * An object that describes the portals to be set up. It mirrors the structure of anchors and provides configuration details for each portal.
* `getEntry`: `(...args: any[]) => any`
  * A function that returns the entry object for each portal. This function is used to generate or retrieve the entry logic needed to initialize each portal.
* `idCache`: `IdCache`
  * A cache object used for managing and tracking the IDs of portal entries. This helps in efficiently managing portal instances and their identifiers.
* `portalsCache`: `Portals`
  * A cache object used to store and manage the portal instances. This cache keeps track of the active portals and their associated data.

Returns
* `PortalsDescriptor`
  * An object that represents the set up portals, with methods for managing each portal entry (e.g., opening, updating, closing, and removing entries).

**Example:**
```typescript
import { anchorsSetup, createIdCache } from '@pastweb/tools';

const anchors = {
  header: 'header-portal',
  footer: 'footer-portal',
  content: {
    main: 'main-content-portal',
    sidebar: 'sidebar-portal',
  },
};

const descriptor = {
  header: { /* header-specific settings */ },
  footer: { /* footer-specific settings */ },
  content: {
    main: { /* main-content-specific settings */ },
    sidebar: { /* sidebar-specific settings */ },
  },
};

const idCache = createIdCache();
const portalsCache = {}; // Assuming portalsCache is initialized accordingly

const portals = anchorsSetup(anchors, descriptor, () => MyEntryFunction, idCache, portalsCache);

portals.header.open(MyComponent, { prop: 'value' });
portals.content.sidebar.update('someId', { newProp: 'newValue' });
```

`Helper Function`: `setPortals`
The `setPortals` function is a recursive helper that sets up portals within the provided structure.
It ensures that each portal is correctly initialized based on its associated ID and configuration.

**Syntax:**
```typescript
function setPortals(
  ids: Record<string, any>,
  descriptor: Record<string, any>,
  portals: Record<string, any>,
  getEntry: () => any,
  idCache: IdCache,
  portalsCache: Portals
): void;
```

Parameters
* `ids`: `Record<string, any>`
  * A mapping of portal anchor IDs to their corresponding DOM element IDs or nested structures.
* `descriptor`: `Record<string, any>`
  * A mapping of portal descriptors, which mirror the structure of ids. This describes the configurations for each portal.
* `portals`: `Record<string, any>`
  * An object that will be populated with portal functions. This object will contain methods for interacting with each portal.
* `getEntry`: `() => any`
  * A function that returns the entry logic for initializing the portal.
* `idCache`: `IdCache`
  * A cache for managing portal entry IDs.
* `portalsCache`: `Portals`
  * A cache for storing and managing the portals.

Returns
* `void`
  * The function does not return a value. Instead, it mutates the portals object to populate it with the necessary portal functions.

Error Handling
* `Throws`
  * An error is thrown if the structure of descriptor does not match the structure of ids, or if a portal setup encounters a type inconsistency.

---

### `generateAnchors`

Generates a set of unique anchor IDs based on an array of anchor paths.
This function is used to create a structured object where each path is associated with a unique ID, which can be used to identify elements in a portal system.

> #### Syntax
```typescript
function generateAnchors(anchors: string[], idCache?: IdCache): PortalAnchorsIds;
```
Parameters
* `anchors`: `string[]`:
  * An array of strings representing the anchor paths. Each path can be a simple string or a dot-separated string representing a nested structure (e.g., "header.menu.item").
* `idCache`: `IdCache`: _(optional)_
  * An instance of IdCache used to generate unique IDs. If not provided, it defaults to DEFAULT_ID_CACHE, which is a default cache instance. The IdCache helps ensure that IDs are unique within a specified scope.

Returns
* `PortalAnchorsIds`:
  * An object that maps each anchor path to a unique ID.
  The structure of the returned object mirrors the nested structure of the anchor paths, with each leaf node being a unique ID.

**Example:**
```typescript
import { generateAnchors, createIdCache } from '@pastweb/tools';

const anchors = [
  'header.menu.item1',
  'header.menu.item2',
  'footer.link1',
  'footer.link2'
];

const idCache = createIdCache();
const anchorIds = generateAnchors(anchors, idCache);

console.log(anchorIds);
/* Example output:
{
  header: {
    menu: {
      item1: "item1-unique-id",
      item2: "item2-unique-id"
    }
  },
  footer: {
    link1: "link1-unique-id",
    link2: "link2-unique-id"
  }
}
*/
```

Use Case
The generateAnchors function is typically used in situations where you need to dynamically generate and manage a set of element IDs for a portal system, especially when working with nested structures. By using this function, you can ensure that each element within your portal system has a unique identifier, making it easier to manage and reference these elements in your application.

---
### `getFullElementSize`
Calculates the full size of an HTML element, including padding, border, and margin, with the option to exclude certain attributes.

> #### Syntax
```typescript
function getFullElementSize(element: HTMLElement | null | undefined, exclude?: ATTRIB[]): FullElementSize;
```

Parameters
* `element`: `HTMLElement | null | undefined`:
  * The HTML element whose size is to be calculated. If the element is null or undefined, an empty size object is returned.
* `exclude`: `ATTRIB[]`: _(optional)_
  * An optional array of attribute names to exclude from the size calculation. The ATTRIB type represents CSS properties like padding, border, and margin. Defaults to an empty array.

Returns
* `FullElementSize`
The full size of the element, including padding, border, and margin, as an object with width and height properties.

**Example:**
```typescript
import { getFullElementSize } from '@pastweb/tools';

const element = document.getElementById('myElement');
const size = getFullElementSize(element);
console.log(size.width, size.height); // Output: { width: ..., height: ... }
```

Details
The `getFullElementSize` function is useful for calculating the total size of an HTML element, considering not only its content but also the additional space taken up by padding, border, and margin. This is particularly helpful in layout calculations where precise element dimensions are necessary.

Special Considerations
* `Server-Side Rendering (SSR)`:
  * If the function is executed in a server-side rendering (SSR) context, it will return an empty size object since the DOM is not available in SSR.

* `Empty Elements`:
  * If the element parameter is null or undefined, the function will return an empty size object with both width and height set to 0.

**Example with Exclusion**
You can exclude specific attributes from the size calculation, such as excluding padding:
```typescript
import { getFullElementSize, ATTRIB } from '@pastweb/tools';

const element = document.getElementById('myElement');
const size = getFullElementSize(element, [ATTRIB.paddingTop, ATTRIB.paddingBottom]);
console.log(size.width, size.height);
```
In this example, the size calculation excludes the top and bottom padding of the element.

Related Types
* `FullElementSize`:
  * An object type with width and height properties representing the full dimensions of an element.
* `ATTRIB`:
  * An enumeration type representing various CSS attributes like padding, border, and margin that can be included or excluded in the size calculation.

Constants Used
* `EMPTY`:
  * A constant representing an empty size object { width: 0, height: 0 }.
* `ATTRIBS`:
  * An object mapping dimension keys (width, height) to arrays of related CSS attributes that contribute to the size of an element.

---

## Object functions

### `assign`

Assigns a value to a target object at a specified path.
The function supports both mutable and immutable updates, allowing you to either directly modify the target object or return a new object with the updated value.

> #### Syntax
```typescript
function assign(target: Record<string, any>, path: string, value: any, immutable?: boolean): void | Record<string, any>;
```
Parameters
* `target`: `Record<string, any>`:
  * The target object to assign the value to.
* `path`: `string`:
  * The path at which to assign the value, specified as a dot-separated string.
* `value`: `any`:
  * The value to assign.
* `immutable`: `boolean`: _(optional, default: false)_
  * If true, performs an immutable update, returning a new object.

Returns
* `void` | `Record<string, any>`:
  * If immutable is true, returns the new object with the assigned value.
  Otherwise, returns void.

**Example:**
```typescript
import { assign } from '@pastweb/tools';

const obj = { a: { b: 2 } };

// Mutable update
assign(obj, 'a.b', 3);
console.log(obj); // Output: { a: { b: 3 } }

// Immutable update
const newObj = assign(obj, 'a.c', 4, true);
console.log(newObj); // Output: { a: { b: 3, c: 4 } }
console.log(obj);    // Output: { a: { b: 3 } } (remains unchanged)
```
---
### `deepMerge`

A utility function that deeply merges two or more objects, handling nested objects and arrays in a sophisticated manner.
This function is particularly useful when you need to combine multiple configuration objects or deeply nested data structures.

> #### Syntax
```typescript
function deepMerge(...sources: { [key: string]: any }[]): { [key: string]: any }
```

Parameters
* `...sources`: `{ [key: string]: any }[]`
  * One or more source objects to merge. Each object in the sources array is merged into the preceding one, with later objects overwriting properties of earlier ones where conflicts arise.

Returns
* `{ [key: string]: any }`:
A new object resulting from deeply merging all provided source objects.
The merge is performed in such a way that nested objects and arrays are combined rather than simply overwritten.

**Example:**
```typescript
import { deepMerge } from '@pastweb/tools';

const obj1 = {
  name: 'Alice',
  details: { age: 25, location: 'Wonderland' },
  hobbies: ['reading', 'chess'],
};

const obj2 = {
  details: { age: 30, job: 'Explorer' },
  hobbies: ['adventure'],
};

const merged = deepMerge(obj1, obj2);

console.log(merged);
// Output:
// {
//   name: 'Alice',
//   details: { age: 30, location: 'Wonderland', job: 'Explorer' },
//   hobbies: ['adventure'],
// }
```
---

### `getType`

The `getType` function is a utility that determines the type of a given value in a precise manner.
It returns the type of the target as a string, providing a more accurate result than the native `typeof` operator, especially for complex data types.

> #### Syntax
```typescript
function getType(target: any): string;
```

Parameters
* `target`: `any`
  * The value whose type is to be determined. This can be any JavaScript value, such as a string, number, object, array, function, etc.

Returns
* `string`:
  * A string representing the type of the target. The returned string is one of the built-in JavaScript types (e.g., `"Object"`, `"Array"`, `"Function"`, `"String"`, `"Number"`, `"Null"`, `"Undefined"`, etc.). See the table below for known/common return values.

#### Known returned values

| JavaScript value                  | Returned string |
|-----------------------------------|-----------------|
| `string` (primitive or `new String()`) | `"String"` |
| `number` (incl. `NaN`, `Infinity`) | `"Number"` |
| `boolean` (primitive or `new Boolean()`) | `"Boolean"` |
| `undefined`                       | `"Undefined"` |
| `null`                            | `"Null"` |
| `symbol`                          | `"Symbol"` |
| `bigint`                          | `"BigInt"` |
| plain object `{}` or `new Object()` | `"Object"` |
| `Array` `[]` or `new Array()`     | `"Array"` |
| `Function` (incl. arrow functions, `class`, `new Function()`) | `"Function"` |
| `Date` `new Date()`               | `"Date"` |
| `RegExp` `/a/` or `new RegExp()`  | `"RegExp"` |
| `Map` `new Map()`                 | `"Map"` |
| `Set` `new Set()`                 | `"Set"` |
| `Error` (and subclasses like `TypeError`) | `"Error"` |
| `Promise` `new Promise(...)`      | `"Promise"` |
| `WeakMap` / `WeakSet`             | `"WeakMap"` / `"WeakSet"` |
| `ArrayBuffer`, `DataView`, typed arrays (e.g. `Uint8Array`) | `"ArrayBuffer"`, `"DataView"`, `"Uint8Array"`, ... |
| DOM elements (browser)            | e.g. `"HTMLDivElement"`, `"HTMLElement"`, ... |
| User-defined classes (default)    | `"Object"` (unless `toString` is overridden) |

**Example:**
```typescript
import { getType } from '@pastweb/tools';

console.log(getType(123)); // "Number"
console.log(getType('Hello')); // "String"
console.log(getType([1, 2, 3])); // "Array"
console.log(getType({ key: 'value' })); // "Object"
console.log(getType(null)); // "Null"
console.log(getType(undefined)); // "Undefined"
console.log(getType(() => {})); // "Function"
console.log(getType(new Date())); // "Date"
```

Use Cases
* `Type Checking`:
  * When you need to check the type of a value with more precision than typeof allows, especially in cases where you need to distinguish between objects, arrays, and null values.
* `Validation`:
  * Useful in scenarios where input validation is required, and you need to ensure that a value is of a specific type before proceeding with further operations.
* `Debugging`:
  * Helps in debugging by providing clear and accurate type information, which can be logged or used to enforce certain conditions in your code.

Notes
* `Precise Type Detection`:
  * getType provides a precise type string for complex types like `"Array"`, `"Date"`, `"RegExp"`, etc., which `typeof` would otherwise categorize as `"object"`.
* `Null Handling`:
  * Unlike typeof, which returns `"object"` for `null`, `getType` correctly identifies null values by returning `"Null"`.
* `Custom Objects`:
  * For user-defined classes, the function will return `"Object"` unless the `Object.prototype.toString` method is overridden.

Edge Cases
* `Null and Undefined`:
  * Returns `"Null"` and `"Undefined"` for `null` and `undefined` values, respectively, providing more clarity than `typeof`, which returns `"object"` for `null`.
* `Symbol`:
  * Correctly returns `"Symbol"` for symbol values, which `typeof` also handles but might be less intuitive in some cases.

---

### `isObject`

The `isObject` function checks whether a given value is an object.
It returns true if the value is an object, and false otherwise.

> #### Syntax
```typescript
function isObject(target: any): boolean;
```

Parameters
* `target`: `any`
  * The value to check. This can be of any type (e.g., string, number, array, object, etc.).

Returns
* `boolean`:
  * Returns true if the target is of type Object; otherwise, it returns false.

**Example:**
```typescript
import { isObject } from '@pastweb/tools';

console.log(isObject({})); // true
console.log(isObject([])); // false
console.log(isObject(null)); // false
console.log(isObject('hello')); // false
```
---

### `isType`

The `isType` function is a utility that checks whether a given value matches a specified type.
It uses the [`getType`](#gettype) function internally for accurate type detection (more reliable than the native `typeof` operator).

> #### Syntax
```typescript
function isType(type: string, target: any): boolean;
```

**Parameters**
* `type`: `string`
  * The expected type name as returned by `getType` (e.g. `"String"`, `"Number"`, `"Array"`, `"Object"`, `"Null"`, `"Undefined"`, `"Date"`, etc.).
* `target`: `any`
  * The value to test.

**Returns**
* `boolean`:
  * `true` if the value is not `null`/`undefined` **and** `getType(target) === type`; otherwise `false`.

**Important:** The function explicitly returns `false` for `null` and `undefined` (even when checking for `"Null"` or `"Undefined"`) due to an internal guard.

**Example:**
```typescript
import { isType } from '@pastweb/tools';

console.log(isType('String', 'Hello')); // true
console.log(isType('Number', 123)); // true
console.log(isType('Array', [1, 2, 3])); // true
console.log(isType('Object', { key: 'value' })); // true
console.log(isType('Null', null)); // false   // explicit guard
console.log(isType('Undefined', undefined)); // false
console.log(isType('Function', () => {})); // true
console.log(isType('Date', new Date())); // true
console.log(isType('RegExp', /foo/)); // true
```

**Use Cases**
* `Type Validation`:
  * Use `isType` when you need to validate that a value is of a specific type before proceeding with further operations.
* `Conditional Logic`:
  * Helps in conditionally executing code based on the type of a variable, ensuring that the operations being performed are type-safe.
* `Form Validation`:
  * Useful in form validation scenarios where input values need to be checked against expected types before submission or processing.

**Notes**
* `Precision via getType`:
  * Leverages `getType` (based on `Object.prototype.toString`) for reliable detection of arrays, dates, null, etc.
* `Null / Undefined Guard`:
  * Always returns `false` for `null` and `undefined` to avoid common type-checking pitfalls.

**Edge Cases**
* `Null and Undefined`:
  * `isType('Null', null)` and `isType('Undefined', undefined)` both return `false` (intentional guard).
* `Custom Objects`:
  * User-defined classes usually match `"Object"` (same as `getType`).

---

### `remove`

The remove function is used to delete a property from an object based on a dot-separated path. This operation can be performed either mutably (modifying the original object) or immutably (returning a new object without modifying the original).

> #### Syntax
```typescript
function remove(target: Record<string, any>, path: string, immutable?: boolean): void | Record<string, any>;
```

Parameters
* `target`: `Record<string, any>`
  * The object from which a property should be removed. The function will navigate through the object using the provided path.
* `path`: `string`
  * A dot-separated string representing the path of the property that should be removed. For example, `"a.b.c"` would target the property `c` nested inside the objects `b` and `a`.
* `immutable`: `boolean` _(Optional)_
  * A flag indicating whether the operation should be immutable or not:
    * If `true`, a new object is returned with the specified property removed, leaving the original object unchanged.
    * If `false` (default), the property is removed from the original object.

Returns
* `void | Record<string, any>`:
  * If `immutable` is `true`, the function returns a new object with the specified property removed.
  * If `immutable` is `false`, the function modifies the original object and returns void.
  * If the `target` is not an object or if the `path` is empty, the function returns the `target` unmodified.

**Example:**
```typescript
import { remove } from '@pastweb/tools';

const obj = { a: { b: { c: 42 } } };

// Mutable operation (modifies the original object)
remove(obj, 'a.b.c');
console.log(obj); // Output: { a: { b: {} } }

// Immutable operation (returns a new object)
const newObj = remove(obj, 'a.b.c', true);
console.log(newObj); // Output: { a: { b: {} } }
console.log(obj);    // Output: { a: { b: { c: 42 } } } (original object unchanged)
```
---

### `select`

The select function is a utility that allows you to safely retrieve the value of a deeply nested property within an object using a dot-separated path.
If the specified path does not exist in the object, the function can return a default value instead of undefined.

> #### Syntax
```typescript
function select(target: Record<string, any>, path: string, defaultValue?: any): any;
```

Parameters
* `target`: `Record<string, any>`
  * The object from which the value should be retrieved. The function navigates through the object based on the provided path.
* `path`: `string`
  * A dot-separated string that represents the path to the property you want to retrieve. For example, `"a.b.c"` would target the property `c` nested inside the objects `b` and `a`.
* `defaultValue`: any _(Optional)_
  * The value to return if the specified path does not exist in the object. This defaults to `undefined` if not provided.

Returns
* `any`:
  * The value located at the specified path if it exists in the object. If the path does not exist, the function returns the `defaultValue`.

**Example:**
```typescript
import { select } from '@pastweb/tools';

const obj = { a: { b: { c: 42 } } };

// Retrieving an existing value
const value = select(obj, 'a.b.c'); 
console.log(value); // Output: 42

// Retrieving a non-existing value with a default
const missingValue = select(obj, 'a.b.x', 'default');
console.log(missingValue); // Output: 'default'

// Retrieving a non-existing value without a default
const noDefault = select(obj, 'a.b.x');
console.log(noDefault); // Output: undefined
```

Edge Cases
* `Empty Path`: If the path is an empty string, the function will return `defaultValue`.
* `Non-Object Target`: If the target is not an object, the function immediately returns `defaultValue`.
---

### `setReadOnly`

Makes one or more properties of an object read-only (immutable) by setting `writable: false` and `configurable: false` using `Object.defineProperty`.

Once a property is made read-only:
- Its value cannot be reassigned.
- It cannot be deleted or reconfigured (e.g. you cannot change it back to writable).

Only properties that already exist on the target object are affected. Non-existing property names passed in the `prop` list are silently ignored.

**Note:** In non-strict mode, assignments to non-writable properties fail silently. In strict mode they throw a `TypeError`.

> #### Syntax
```typescript
function setReadOnly<T extends object>(
  target: T,
  prop: Extract<keyof T, string> | Extract<keyof T, string>[]
): void;
```

**Parameters**
* `target`: `T extends object`
  * The object whose properties should be made read-only.
* `prop`: `string | string[]`
  * A single property name or an array of property names to make read-only. Only properties that exist on `target` will be processed.

**Returns**
* `void`

**Example:**
```typescript
import { setReadOnly } from '@pastweb/tools';

const user = { id: 1, name: 'Alice', role: 'admin' };

// Make a single property read-only
setReadOnly(user, 'id');
user.id = 99; // throws TypeError (strict mode) or is ignored

// Make multiple properties read-only
setReadOnly(user, ['name', 'role']);
user.name = 'Bob'; // read-only
user.role = 'user'; // read-only

// Non-existing properties are ignored (no error)
setReadOnly(user, ['id', 'doesNotExist']);
```

**Use Cases**
* `Configuration Objects`:
  * Protecting critical configuration values from accidental modification after initialization.
* `Constants / Enums`:
  * Making certain properties on plain objects behave like true constants.
* `API Response Objects`:
  * Ensuring that certain fields returned from an API cannot be mutated by consumer code.
* `Security / Integrity`:
  * Preventing tampering with sensitive data (IDs, permissions, etc.) stored on objects.

**Notes**
* This function only affects **existing** own enumerable properties.
* It sets both `writable` and `configurable` to `false`. This is stronger than just `writable: false` (prevents `delete` and redefinition).

**Edge Cases**
* Passing an empty array does nothing (no properties are made read-only).
* Passing a property that doesn't exist on the object has no effect.
* The function does **not** make the object itself non-extensible (you can still add new properties).
* Works on plain objects, class instances, etc.

---

### `setSymbolKey`

Attaches a symbol as a hidden property on the target object.

By default the property is installed as non-enumerable, non-writable and non-configurable (using the exported `DEFAULT_SYMBOL_DESCRIPTOR`). This makes the symbol invisible to normal object iteration (`Object.keys`, `for...in`, `JSON.stringify`, spread, etc.) while still allowing detection via `Object.hasOwn(target, symbol)` or `Object.getOwnPropertySymbols(target)`.

This is the canonical way to install internal "marker" symbols used by the reactivity system (`REF`, `COMPUTED`, `REACTIVE`) and other modules (`PORTAL`, `GLOBAL_CONTEXT_TYPE`, ...).

> #### Syntax
```typescript
function setSymbolKey(
  target: Record<PropertyKey, any>,
  symbol: symbol,
  value?: any,
  descriptor?: Descriptor
): void;
```

Parameters
* `target`: `Record<PropertyKey, any>`
  * The object that will receive the symbol property.
* `symbol`: `symbol`
  * The `Symbol` key to attach.
* `value`: `any` _(optional, default: `true`)_
  * The value stored under the symbol (most markers just use the boolean `true`).
* `descriptor`: `Descriptor` _(optional)_
  * Descriptor options. Defaults to `DEFAULT_SYMBOL_DESCRIPTOR` (`{ configurable: false, enumerable: false, writable: false }`).

Returns
* `void`

**Example:**
```typescript
import { setSymbolKey, DEFAULT_SYMBOL_DESCRIPTOR } from '@pastweb/tools';

const MY_MARKER = Symbol('myMarker');
const obj: any = { visible: 42 };

setSymbolKey(obj, MY_MARKER);
setSymbolKey(obj, MY_MARKER, 'hello world'); // overwrite value

console.log(obj[MY_MARKER]);                    // 'hello world'
console.log('MY_MARKER' in obj);                // false
console.log(Object.keys(obj));                  // ['visible']
console.log(Object.getOwnPropertySymbols(obj)); // [ MY_MARKER ]

// You can still inspect it
console.log(Object.hasOwn(obj, MY_MARKER));     // true
```

Use Cases
* `Internal Markers`: attaching hidden flags that can be detected by `isRef`, `isComputed`, `isReactive`, `isPortal`, `isGlobalContext`, etc. without polluting the public shape of objects.
* `Branding / Nominal Typing`: adding a symbol "brand" to objects so that type guards or runtime checks can recognise "our" instances even when they are plain objects or proxies.
* `Non-Enumerable Metadata`: storing metadata that should never appear in `JSON.stringify`, `Object.entries`, or `for...in` loops.

Notes
* The default descriptor (`DEFAULT_SYMBOL_DESCRIPTOR`) is the recommended shape for marker symbols. You can pass a custom `descriptor` if you need different behaviour (e.g. make it enumerable for debugging).
* Because symbols are used as keys, there is no risk of name collision with string properties.
* This function is intentionally low-level; most consumers should use the higher-level helpers (`setAsGlobalContext`, the reactivity `reactive`/`ref`/`computed` factories, `createPortal`, etc.) which call it internally.

---

### `update`

The update function is a utility for updating the properties of a target object with values from a source object.
It supports both shallow and deep updates, and it allows you to exclude specific properties from being updated.

> #### Syntax
```typescript
function update<T>(target: T, toUpdate: Partial<T>, options: UpdateOptions<T> = {}): void;
```
Parameters
* `target`: `T`
  * The object that will be updated. The update operation modifies this object in place.
* `toUpdate`: `Partial<T>`
  * An object containing the properties and corresponding values to be updated in the target. Only the properties present in this object will be considered for the update.
* `options`: `UpdateOptions<T>` _(Optional)_
  * Configuration options for the update operation:
    * `shallow`: `boolean` _(default: false)_
      * If true, the update will be shallow, meaning nested objects will not be deeply merged.
    * `exclude`: `keyof T | (keyof T)[]` _(default: [])_
      * A property or an array of properties to exclude from the update. These properties in the target object will not be modified, even if they exist in toUpdate.

Returns
* `void`:
  * The function modifies the target object directly and does not return a value.

**Example:**
```typescript
import { update } from '@pastweb/tools';

const target = { a: 1, b: { c: 2 } };
const toUpdate = { a: 10, b: { c: 20 } };

update(target, toUpdate);
console.log(target); 
// Output: { a: 10, b: { c: 20 } }

const toUpdate2 = { a: 100, b: { d: 30 } };

update(target, toUpdate2, { shallow: true });
console.log(target); 
// Output: { a: 100, b: { c: 20 } }, shallow update prevents deep merge

const toUpdate3 = { a: 200 };

update(target, toUpdate3, { exclude: 'a' });
console.log(target); 
// Output: { a: 100, b: { c: 20 } }, as 'a' was excluded from the update
```

Notes
* `Type Safety`: The function is generic, which means it can work with any type of object, preserving type safety during updates.
* `Nested Object Handling`: The function smartly handles nested objects by either deeply merging them or performing shallow updates based on the `shallow` option.
* `Default Options`: The `options` parameter can be omitted, in which case the function uses its default settings (`shallow: false`, `exclude: []`).

Edge Cases
* `Non-Object Inputs`: If either `target` or `toUpdate` is not an object, the function returns immediately without performing any updates.
* `Empty toUpdate Object`: If `toUpdate` is empty or contains no properties, the `target` remains unchanged.

---

### `withDefaults`

The withDefaults function merges a target object with a set of default values.
It ensures that any properties missing in the target object are filled in with the corresponding values from the defaults object.
If a property exists in both the target and the defaults, the target's value is retained.

> #### Syntax
```typescript
function withDefaults<WithDefaults extends {} = {}>(target: any & object, defaults: any & object): WithDefaults;
```
Parameters
* `target`: `any & object`
  * The object that will be merged with the defaults. This object may have some, all, or none of the properties found in defaults.
* `defaults`: `any & object`
  * The object containing default values for the properties that might be missing in the target object.

Returns
* `WithDefaults`
  * A new object that merges the target object with the defaults object. The resulting object includes all properties from the target, with any missing properties filled in from the defaults object.

**Example:**
```typescript
import { withDefaults } from '@pastweb/tools';

const userSettings = { theme: 'dark' };
const defaultSettings = { theme: 'light', fontSize: 'medium' };

const finalSettings = withDefaults(userSettings, defaultSettings);
console.log(finalSettings); // Output: { theme: 'dark', fontSize: 'medium' }
```
---

## Reactivity

### `reactive`

The `reactive` function creates a reactive proxy for an object, enabling dependency tracking and automatic effect triggering when properties are accessed or modified. This is useful for building reactive state management systems where changes to an object's properties trigger updates in dependent computations or UI components.

> #### Syntax
```typescript
function reactive<T extends object>(obj: T, deep = false): T;
```

Parameters
* `obj`: `T extends object`
  * The object to make reactive. This can be any JavaScript object, such as a plain object or array.
* `deep`: `boolean` _(optional)_
  * If `true`, nested objects accessed via properties are also made reactive. Defaults to `false`.

Returns
* `T`
  * A reactive proxy of the input object, with the same type as the input. The proxy tracks property access and triggers effects on property changes.

**Example:**
```typescript
import { effect, reactive } from '@pastweb/tools';

const obj = reactive({ count: 0 });

effect(() => {
  console.log(`Count is: ${obj.count}`);
});

obj.count = 1; // Logs: "Count is: 1"
obj.count = 2; // Logs: "Count is: 2"

const deepObj = reactive({ nested: { value: 10 } }, true);
effect(() => {
  console.log(`Nested value: ${deepObj.nested.value}`);
});
deepObj.nested.value = 20; // Logs: "Nested value: 20"
```

Use Cases
* `State Management`: creating reactive state objects in frameworks like Vue.js or custom reactive systems, where changes to state automatically update the UI.
* `Data Binding`: enabling two-way data binding in applications by tracking property changes and updating dependent components.
* `Observable Data`: building observable data structures for real-time applications, such as dashboards or live-updating forms.

Notes
* `Performance`: the function uses `Proxy` for reactivity, which is efficient but may have performance implications for large objects with frequent access or updates.
* `Immutability`: the original object is modified to include a non-enumerable `isReactive` symbol to mark it as reactive. This property is not writable or configurable.
* `Deep Reactivity`: when `deep` is `true`, nested objects are recursively made reactive, which can increase memory usage for complex object graphs.

Edge Cases
* `Non-Object Inputs`: the function expects an object as input. Passing non-objects (e.g., primitives) will result in a TypeScript type error.
* `Circular References`: deep reactivity may cause issues with circular references, requiring careful handling to avoid infinite recursion.

---

### `ref`

The `ref` function creates a reactive reference (ref) for a single value, wrapping it in a reactive object with a `value` property. This is useful for managing reactive primitive values or simple state in reactive systems.

> #### Syntax
```typescript
function ref<T>(value: T, deep = false): { value: T };
```

Parameters
* `value`: `T`
  * The value to make reactive. This can be any value, including primitives (e.g., number, string) or objects.
* `deep`: `boolean` _(optional)_
  * If `true`, nested objects within the value are also made reactive when accessed. Defaults to `false`.

Returns
* `{ value: T }`
  * A reactive object with a single `value` property that holds the input value. The object is reactive, tracking access and triggering effects on changes.

**Example:**
```typescript
import { effect, ref } from '@pastweb/tools';

const count = ref(0);

effect(() => {
  console.log(`Count is: ${count.value}`);
});

count.value = 1; // Logs: "Count is: 1"
count.value = 2; // Logs: "Count is: 2"

const deepRef = ref({ nested: 10 }, true);
effect(() => {
  console.log(`Nested value: ${deepRef.value.nested}`);
});
deepRef.value.nested = 20; // Logs: "Nested value: 20"
```

Use Cases
* `Single Value Reactivity`: managing reactive state for single values, such as counters, flags, or settings, in reactive applications.
* `Form Inputs`: binding form input values to reactive refs for real-time validation or updates.
* `State Isolation`: isolating a single piece of state in a reactive system, making it easier to manage compared to complex objects.

Notes
* `Performance`: refs are lightweight due to their single-property structure, but deep reactivity (when enabled) may add overhead for nested objects.
* `Immutability`: the returned ref object includes a non-enumerable `isRef` symbol to mark it as a ref, which is not writable or configurable.
* `Type Safety`: the generic type `T` ensures type safety for the `value` property, allowing TypeScript to enforce correct usage.

Edge Cases
* `Primitive vs. Object Values`: the function works with both primitives and objects, but deep reactivity only applies to object values.
* `Reassignment`: reassigning the entire ref object (e.g., `count = ref(5)`) does not affect reactivity; only changes to the `value` property are tracked.

---

### `effect`

The `effect` function creates a reactive effect that runs when its dependencies change. It supports tracking dependencies from reactive objects, refs, or computed values, making it a core component of reactive systems.
If no `source` is provided, the callback is immediately executed (registering any reactive dependencies accessed inside it automatically).
When dependencies are specified, the callback only re-runs when those dependencies change.
Pass `immediate = true` as the third argument to run the effect immediately on creation.

The `source` can be:
- a function returning a single value or an array of values (e.g. `() => dep` or `() => [dep1, dep2, dep3.value]` — property accesses and `.value` reads inside will be tracked automatically),
- a single `ref`, `reactive` object, or `computed`,
- or an array mixing the above (for non-direct values inside an array, wrap them as `() => value`).

If a reactive object is passed as a dependency, the effect runs when any of its properties change.

> #### Syntax
```typescript
function effect<T>(
  fn: (newVal: any | any[], oldVal: any | any[]) => void | Promise<void>,
  source?: (() => T) | (() => any[]) | { value: T } | Record<PropertyKey, any> | Array<(() => any) | { value: any } | Record<PropertyKey, any>>,
  immediate = false
);
```

Parameters
* `fn`: `(newVal: any | any[], oldVal: any | any[]) => void`
  * The effect function to run when dependencies change. It receives the new and old values of the tracked source(s).
* `source`: `(() => T) | (() => any[]) | { value: T } | Record<PropertyKey, any> | Array<...>` _(optional)_
  * The reactive source(s) to track. Supports:
    - A function returning a scalar value or an array of values (e.g. `() => dep` or `() => [dep1, dep2, dep3.value]`).
    - A single `ref`, reactive object, or `computed`.
    - An array of the above (wrap non-direct items with `() => value` inside arrays).
  If omitted, the effect tracks all reactive dependencies accessed within `fn`.
* `immediate`: `boolean` _(optional)_
  * If `true`, the effect runs immediately upon creation. Defaults to `false`.

Returns
* `void`
  * The function does not return a value but sets up a reactive effect that runs when dependencies change.

**Example:**
```typescript
import { effect, reactive, ref } from '@pastweb/tools';

// Example with a ref
const count = ref(0);
effect((newVal) => {
  console.log(`Count changed to: ${newVal}`);
}, count);
count.value = 1; // Logs: "Count changed to: 1"

// Example with a reactive object
const obj = reactive({ value: 10 });
effect((newVal) => {
  console.log(`Value is: ${newVal.value}`);
}, obj, true); // Logs immediately: "Value is: 10"
obj.value = 20; // Logs: "Value is: 20"

// Example with multiple sources (array form)
const source1 = ref(1);
const source2 = reactive({ x: 2 });
effect((newVal) => {
  console.log(`Sources: ${newVal[0]}, ${newVal[1].x}`);
}, [source1, source2]);
source1.value = 3; // Logs: "Sources: 3, 2"
source2.x = 4; // Logs: "Sources: 3, 4"

// Example with a function returning an array of dependencies (new supported form)
const a = reactive({ x: 10 });
const b = ref(20);
effect((newVal) => {
  console.log(`Array deps: ${newVal[0]}, ${newVal[1]}`);
}, () => [a.x, b.value]);
a.x = 11; // Logs: "Array deps: 11, 20"
b.value = 21; // Logs: "Array deps: 11, 21"
```

Use Cases
* `UI Updates`: automatically updating UI elements when reactive state changes, such as in reactive frameworks or custom rendering logic.
* `Side Effects`: performing side effects (e.g., logging, API calls) in response to changes in reactive data.
* `Dependency Tracking`: creating computed values or derived state that depend on multiple reactive sources.

Notes
* `Performance`: the effect uses debouncing (with a 16ms delay) to optimize performance and prevent excessive re-runs during rapid updates.
* `Dependency Collection`: dependencies are automatically collected during the execution of `fn` or `source` if they are reactive (via `reactive` or `ref`).
* `Value Comparison`: the effect only runs if the new value differs from the old value, with special handling for arrays to check element-wise changes.

Edge Cases
* `No Source`: if no `source` is provided, the effect tracks all reactive dependencies accessed within `fn`, which may lead to unintended dependencies if not carefully managed.
* `Immediate Execution`: when `immediate` is `true`, the effect runs immediately, which may cause unexpected behavior if `fn` has side effects that depend on initialization.

---

## `isRef` / `isReactive` / `isComputed` (utilities)

These helpers inspect the internal marker symbols installed via [`setSymbolKey`](#setsymbolkey).

- `isRef(value)` — returns `true` for values created by `ref()` and for all computed results (computed values are treated as a kind of ref for the effect system).
- `isReactive(value)` — returns `true` only for objects created by `reactive()`.
- `isComputed(value)` — returns `true` only for values created by `computed()`.

All three correctly handle both the classic boxed form and the transparent proxy form used for object results.

**Example**
```ts
const r = reactive({ x: 1 });
const c = ref(42);
const comp = computed(() => r.x * 2);

isReactive(r);   // true
isRef(c);        // true
isRef(comp);     // true   (computed is also a ref)
isComputed(comp);// true
```

**Pure ref vs. computed (for `isRef`)**

Because every `computed()` result carries the `REF` marker (so that `isRef(comp)` and direct use as an `effect()` source continue to work), `isRef(result)` alone does **not** guarantee that `result` came from `ref()`.

To be sure you have a *pure* ref (created by `ref()`, excluding computed values), test both:

```ts
const result = getSomeReactiveValue(); // might be a ref() or a computed()

if (isRef(result) && !isComputed(result)) {
  // result is guaranteed to be a plain ref created with ref(), not a computed
  // e.g. you can safely do result.value = ... with ref-specific expectations
  result.value = 123;
}
```

`isRef(result)` will be `true` for both `ref(42)` and `computed(() => ...)` (and their object-shaped proxy forms).

---

### `computed`

The `computed` function creates a lazily-evaluated computed value that re-evaluates only when its dependencies change. This is useful for deriving values from reactive state without re-computing unless necessary.

The getter may be synchronous or asynchronous (`() => T | Promise<T>`).

> #### Syntax
```typescript
function computed<T>(getter: () => T | Promise<T>): Computed<T>;
```

(where `Computed<T>` is `Readonly<T>` when `T` is an object/array, otherwise `{ readonly value: T }`).

Parameters
* `getter`: `() => T | Promise<T>`
  * A function (sync or async) that computes the value based on reactive dependencies. The function is called lazily on first access or when the computed is marked dirty.

Returns
* For object results (including arrays): a readonly proxy to the computed object. You can read properties directly (`computedObj.prop`). The proxy also exposes `.value` (returns the raw object) and carries both the `REF` and `COMPUTED` markers.
* For non-object results: the classic `{ readonly value: T }`.
* In both cases the result is usable as a ref (via `isRef()` and as a direct source to `effect()`). While an async computation is pending, reads return the previous (stale) value.

All computed results carry the `REF` marker (so they are treated as refs for the effect system) and the `COMPUTED` marker (for `isComputed()`).

**Example:**
```typescript
import { computed, effect, ref } from '@pastweb/tools';

const count = ref(1);
const doubled = computed(() => count.value * 2);

console.log(doubled.value); // 2
count.value = 2;
console.log(doubled.value); // 4

effect(() => {
  console.log(`Doubled is: ${doubled.value}`);
});
count.value = 3; // Logs: "Doubled is: 6"
```

Use Cases
* `Derived State`: creating derived state, such as computed properties in Vue.js or calculations based on reactive data.
* `Performance Optimization`: avoiding unnecessary computations by caching the result and only re-computing when dependencies change.
* `Reactive Dependencies`: building values that depend on multiple reactive sources, such as combining refs and reactive objects.

Notes
* `Laziness`: the `getter` function is only called when the `value` property is accessed and the cached value is stale (i.e., dependencies have changed).
* `Caching`: the computed value is cached, improving performance for expensive computations by avoiding redundant work.
* `Dependency Tracking`: the computed value automatically tracks its reactive dependencies, ensuring re-computation only when necessary.

Edge Cases
* `Initial Evaluation`: the `getter` is not called until the `value` property is first accessed, which may delay side effects within the `getter`.
* `Non-Reactive Dependencies`: if the `getter` accesses non-reactive data, changes to that data will not trigger re-computation, potentially leading to stale values.

---

## Global Context

The **Global Context** is a powerful and widely adopted concept in modern frontend frameworks. It enables dependency injection and state sharing between components without requiring deep prop drilling, while also allowing values to be updated and automatically reflected in descendant components.

Although different frameworks implement this concept in various ways, we can identify two primary patterns:

### 1. Context API Pattern
Used by React and React-like libraries:
- [React Context API](https://react.dev/reference/react/createContext)
- [Preact Context](https://preactjs.com/guide/v10/context/)
- [SolidJS Context](https://docs.solidjs.com/concepts/context)

### 2. Global Properties Pattern
Used by:
- [Vue.js `app.config.globalProperties`](https://vuejs.org/api/application.html#app-config-globalproperties)
- [Svelte Context](https://svelte.dev/docs/svelte/context)

> **Note**: How you can see in `svelte` documentation the `Context APIs` similar to the `react` implementation has been intoduced from the version `5.40+`.

A third approach — the **Service pattern** — is used in frameworks like [Angular](https://angular.dev/guide/di/creating-and-using-services) and [Ember](https://guides.emberjs.com/release/services/). While it can serve similar purposes, it was not specifically designed for component tree context sharing.

### Why We Chose the Vue-inspired Approach

To provide a consistent and flexible solution across frameworks, we adopted an approach inspired by Vue’s global properties, while extending it to better support modern needs.

This design decision allows us to achieve the following goals:

1. **Unified API** — A single, clear, and consistent mechanism across all frameworks.
2. **Full Context Capabilities** — Support for both dependency injection and reactive value updates down the component tree.
3. **Cross-Framework Compatibility** — Common interfaces that work seamlessly regardless of the underlying framework.
4. **Mediator Integration** — Full support for accessing and modifying global context from within mediators.

> **Note**: We do not specify the implementation details here. For every framework there will be a dedicated package with the correct strategy and the relative documentation for its usage.

This approach combines the best aspects of existing solutions while providing greater flexibility and a cleaner developer experience.

Below the utilities used for the `Context API pattern` in order to help the implementation for this approach.

Constants and Utilities
* `GLOBAL_CONTEXT_TYPE`: `symbol`
  * Symbol used to identify a global context object.
* `globalContext`: `GlobalContext = Record<string, any>`
  * Reactive global context object as for the `Context API` needs a value to be initialised.
* `function isGlobalContext(target: any): boolean`
  * Checks if the given target is a valid global context object.
* `function setAsGlobalContext(target: GlobalContext): void`
  * Marks the given target object as a Global Context by attaching the `GLOBAL_CONTEXT_TYPE` symbol.
* `function setSymbolKey(target: Record<PropertyKey, any>, symbol: symbol, value?: any, descriptor?: Descriptor): void`
  * Low-level helper used to attach non-enumerable, non-writable, non-configurable symbol markers (e.g. `REF`, `COMPUTED`, `REACTIVE`, `PORTAL`). See the dedicated [`setSymbolKey`](#setsymbolkey) documentation.
* `createMediatorContextUtils`: `function createMediatorContextUtils<T>(mediator: MediatorFunction<T>, props: Props = {}, extras: Extras = {},context: ContextUtils): any & T`
  * Creates and executes a mediator function with an associated context.
* `getContextUtils`: `function getContextUtils(): ContextUtils`
  * Creates and executes a mediator function with an associated context.

Types
* `ContextUtils`: `interface ContextUtils { getContext: <T>(key: string) => T | undefined; setContext: <T>(key: string, value: T) => void; };`,
  - The context utils funcction object to be passed as second parameter to the mediater context function.
* `GlobalContext`: `type GlobalContext = Record<string | symbol, any>;`
  - The generic global context reactive Object.
* `MediatorFunction`: `type MediatorFunction<T = any> = (props: Props) => any & T;`
  - The mediator function described [below](#mediator) which contains the component logic.
* `Props`: `type Props = any & object;`
  - The generic props object passed to the `MediatorFunction`.
* `Extras`: `type Props = any & object;`
  - The exta generic object parameter passed to the `MediatorFunction`.
* `Mediator`: `type Mediator<State extends {} = {}> = { state?: State; } & object;`
  The mediator object returned from the `MediatorFunction`.

### `Mediator`

A `mediator` is a function used to export the component logic outside, rendering the logic portable to different front end frameworks. The `mediator` function receives `props` and `extras` (plus access to context utils via `getContextUtils()`) and returns a mediator object containing a reactive `state` and other properties (methods, lifecycle hooks, `getContext`, etc.).

This is the core pattern used by all `@pastweb` components.

**Typical mediator structure**

```typescript
import { reactive, effect } from '@pastweb/tools';
import type { MyProps, MyMediator, MyState } from './types';

export function myMediator(props: MyProps): MyMediator {
  const state = reactive<MyState>({
    foo: props.foo,
  });

  // React to prop changes (sources are functions so they are tracked)
  effect(
    (foo) => { state.foo = foo; },
    () => props.foo,
  );

  function doSomething() {
    // ...
  }

  return {
    state,
    doSomething,
  };
}
```

Mediators can also interact with Global Context:

```typescript
import { reactive, getContextUtils, effect } from '@pastweb/tools';

function myMediator(props, extras) {
  const state = reactive({ value: 'initialValue' });
  
  const { getContext, setContext } = getContextUtils();
  
  const ctx = getContext('contextKey');
  // the context object is a reactive object
  effect(() => {
    state.value = ctx.value;
  });

  function onClick() {
    setContext('contextKey', 'newValue');
  }

  return { state, onClick };
}
```

The example above shows the generic structure of a mediator function, how to add effects that react to internal `state`, `props`, and how to interact with the `Global Context`.

For router-specific usage of mediators, see the [Router mediator hooks](#router-mediator-hooks) section under `createViewRouter`.

---

### `createMicroStore`

Creates a reactive micro store to share between components that are not necessarily nested.
Accepts a `name` string as the first argument and a `setup` function that returns a `MicroStoreConfig` object with `state` and `actions`.

Inside `actions`, you can mutate the internal reactive state in two ways:
- **`this.state`** — via method shorthand or `function` syntax (recommended for simple access).
- **`select`** — the setup helper passed as the only argument to `setup` (useful for arrow functions or complex selectors).

The returned hook function yields an object with a **readonly** `state` property and the action methods.

> #### Syntax
```typescript
function createMicroStore<
  S extends Record<string, any>,
  A extends Record<string, (...args: any[]) => any>
>(
  name: string,
  setup: (select: <T>(fn: Selector<T, S>) => T) => MicroStoreConfig<S, A>
): UseMicroStore<S, A>
```

Parameters
* `name`: `string`
  * Unique store name (used in error messages and the global registry).
* `setup`: `(select) => MicroStoreConfig<S, A>`
  * Receives a temporary `select` helper and must return `{ state, actions }`.

Returns
* `UseMicroStore<S, A>`
  * A hook function that returns the store state and actions.

Methods
* `useMicroStore(): MicroStore<S, A>`
  * Returns the full store with readonly `state` and actions.
* `useMicroStore(selector): MicroStore<T, A>`
  * Returns the selected readonly `state` slice and actions.

Related Types
* `MicroStoreConfig<S, A>`: setup return shape (`state` + `actions`).
* `MicroStoreActionsContext<S>`: context available as `this` inside actions (`{ state: Reactive<S> }`).
* `MicroStore<S, A>`: full store instance shape.
* `Selector<T, S>`: `(state: S) => T`.

**Example:**
```typescript
import { createMicroStore, effect, type MicroStoreActionsContext } from '@pastweb/tools';

const useCounterStore = createMicroStore('counter', select => ({
  state: {
    count: 0,
    name: 'My Counter'
  },
  actions: {
    increment(by = 1) {
      this.state.count += by;    // Access mutable state via `this`
    },
    decrement(by = 1) {
      this.state.count -= by;
    },
    setName(newName: string) {
      this.state.name = newName;
    },
    // Alternatively, use the setup `select` helper (works with arrow functions too):
    reset() {
      select(s => s).count = 0;
    },
    // Explicit `this` typing when needed:
    add(this: MicroStoreActionsContext<{ count: number; name: string }>, n: number) {
      this.state.count += n;
    },
  },
}));

// === Usage ===

// 1. Full state
const store = useCounterStore();
console.log(store.state.count);
store.increment(5);                    // Works via action

// 2. With selector (any nested value)
const countStore = useCounterStore(s => s.count);
console.log(countStore.state);         // Readonly<number>

const nameStore = useCounterStore(s => s.name);
console.log(nameStore.state);          // Readonly<string>

// Works with your effect system
effect(() => {
  const count = useCounterStore(s => s.count).state;
  console.log('Count changed:', count);
});
```

Notes
* The exposed `.state` on the returned store is **readonly** at both the TypeScript and runtime level. All mutations must go through `actions`.
* Use **method shorthand** or `function` syntax when accessing `this.state`. Arrow functions (`increment: () => { ... }`) do not receive the actions context as `this`; use `select` instead.
* The action name `"state"` is reserved and cannot be used in the `actions` object.
* Selectors can return any value (primitives, objects, arrays, nested properties). Changes via actions are automatically reflected in all selector views.

---

### `createMicroStoreCollector`

Create a collector object, this function is used to force the import/creation of the micro store/s hooks function in the same module there the `createMicroStoreCollector` is called in order to collect them in a single object for future devtoos.
It is possible create multiple `MicroStoreCollector` in order to obtain different logic groups.

> #### Syntax
```typescript
export function createMicroStoreCollector(options: MicroStoreCollectorOptions): CollectedStore
```
Parameters
* `options`: `MicroStoreCollectorOptions`
  * `name`: `string` _(optional)_
    - The collector name.
  * `stores`: `UseMicroStore<S, A> | UseMicroStore<S, A>[]` _(required)_
    - The micro store/s hook to be collected.

Returns
* `CollectedStore` : `Record<string, UseMicroStore<S, A>>`
  * An object with the `MicroStore` name as `key` and the hook function as `value`.


**Example:**
```typescript
import { createMicroStoreCollector } from '@pastweb/tools';
import { useAddressStore, useUserStore, useCartStore } from '.../somewhere'; 

const customerStores = createMicroStoreCollector({
  name: 'customer',
  stores: [useCounterStore, useUserStore, useCartStore],
});

// Usage in DevTools
Object.entries(customerStores).forEach(([name, useStore]) => {
  console.log(`${name} state:`, useStore().state);
});
```
---

## Routing

### `createViewRouter`

The `createViewRouter` function is a core utility for managing routing in a single-page application (SPA).
It provides the ability to define routes, navigate between them, and react to route changes within the application.
The `ViewRouter` uses the [history](https://github.com/browserstate/history.js) library covering the most common
functionalities implemented in other router UI Frameworks like [react-router](https://reactrouter.com/en/main) or [vue-router](https://router.vuejs.org/).
The goal of this implementation is to obtain a consistent set of API and terminology across frameworks.

The router state properties (`currentRoute`, `location`, `isResolving`, `paths`, `base`, etc.) are **reactive**.
Use the library's `effect` / `computed` primitives to react to changes instead of event callbacks.

> #### Syntax
```typescript
function createViewRouter(options: RouterOptions): ViewRouter;
```

Parameters
* `options`: `RouterOptions`
  * An object containing configuration options for the router. The available options include:
  * `base`: `string` _(optional)_
    * The base path for all routes.
  * `debug`: `boolean` _(optional)_
    * If true, enables debug logging for the router.
  * `history`: `History` _(optional)_
    * The history object for managing session history.
  * `routes`: `Route[]` _(mandatory)_
    * An array of route definitions.
  * `preloader`: `() => void` _(optional)_
    * A function to execute before a route is loaded.
  * `RouterView`: `Component` _(mandatory)_
    * The component to render for matched routes.
  * `beforeRouteParse`: `(route: Route) => Route | void | Promise<Route | void>` _(optional)_
    * A function to execute before parsing a route, if you want to modify a `Route`.
  * `beforeRouteSelect`: `(route: SelectedRoute) => SelectedRoute | void | Promise<SelectedRoute | void>` _(optional)_
    * A function to execute before selecting a route, as example for the route authentication/authorization.
  * `sensitive`: boolean _(optional)_
    * If true, route matching will be case-sensitive.
  * `initialRequest`: `NodeRequest` _(optional, SSR only)_
    * An incoming server request. When provided in an SSR context the router will automatically
      initialize using this request so that `currentRoute` / `location` are correct after `await router.ready`.

Returns
* `ViewRouter`
  * An object that represents the router. This object contains reactive properties and methods to manage routing within the application.
  * Key reactive properties: `currentRoute`, `location`, `isResolving`, `paths`, `base`, `documentSettings`, `request` (SSR).
  * `ready: Promise<void>` – resolves once the initial route has been resolved. Use `await router.ready` to safely read `currentRoute` on first access.

**Example (browser + reactivity):**
```typescript
import { createViewRouter, effect } from '@pastweb/tools';

const router = createViewRouter({
  routes: [
    { path: '/', view: 'HomePage' },
    { path: '/about', view: 'AboutPage' },
  ],
});

await router.ready; // optional but recommended

// React to changes using the reactive system
effect(() => {
  console.log('Route changed to:', router.currentRoute.path);
  console.log('Params:', router.currentRoute.params);
});
```

Core Features
* `Route Parsing and Matching`:
  * The router parses and normalizes routes, creating a structure that allows efficient matching of paths against the defined routes.
* `Reactive State`:
  * Router properties (`currentRoute`, `location`, `isResolving`, `paths`, `base`, ...) are powered by the library's reactivity system. Use `effect(() => router.currentRoute)` or `computed` to react to changes.
* `Navigation`:
  * The router offers methods to programmatically navigate, push, replace, or go back and forward in the history stack.
* `Base Path Management`:
  * Allows setting and managing a base path, which is useful for applications hosted under subdirectories.
* `Route Preloading`:
  * Supports route preloading, enabling efficient loading of route components.
* `Custom Hooks`:
  * Provides hooks (`beforeRouteParse`, `beforeRouteSelect`) that allow custom logic to be executed during route parsing and selection.
* `SSR Support`:
  * `initialRequest` option + `router.ready` promise make it easy to initialize the router correctly on the server without seeing a transient empty route.
  
**Example (custom hooks):**
```typescript
  beforeRouteParse: async (route) => {
    // You can now do async work (API calls, config loading, etc.)
    const extraData = await fetch(`/api/route-config${route.path}`);
    return { ...route, meta: { ...route.meta, extraData } };
  },

  beforeRouteSelect: async (route) => {
    if (route.path === '/admin' && !(await isUserAdmin())) {
      return { ...route, redirect: '/login' }; // or throw new Error(...)
    }
    return route;
  }
```

Methods
* `setBase(base: string): Promise<void>`
  * Sets the base path for the router. The base path is the common prefix for all routes.
* `addRoute(route: Route): Promise<void>`
  * Adds a new route to the router dynamically after the router has been initialized.
* `navigate(path: string, state?: any): Promise<void>`
  * Navigates to a specific path programmatically.
* `push(path: string, state?: any): Promise<void>`
  * Pushes a new state onto the history stack and navigates to the specified path.
* `replace(path: string, state?: any): void`
  * Replaces the current state in the history stack with a new state and navigates to the specified path.
* `go(delta: number): void`
  * Moves forward or backward in the history stack by a specified number of steps.
* `setSearchParams(searchParams: URLSearchParams): void`
  * Sets the search parameters for the current location without reloading the page.
* `setHash(hash?: string): void`
  * Sets the hash for the current location without reloading the page.
* `getRoute(pathname: string): Promise<Route | false>`
  * Find and return the current `route` or `false` for not route found.
* `setRequest(request: ServerRequest): Promise<void>`
  * Sets a new location and refreshes the current route. Useful in SSR context to initialize the router with the server request URL.
* `getRouterLink(options: RouterLinkOptions): RouterLink`
  * Creates a router link object that contains methods for navigation and checks if the link is active or exactly active.

Edge Cases
* `No Matching Route`:
  * If no route matches the current path, the router will warn in the console and return a default empty route.
* `Base Path Changes`:
  * When the base path is changed, the router adjusts all existing routes accordingly to ensure consistent matching.

Debugging
If the `debug` option is enabled, the router logs detailed information about its internal state, such as the current paths, parsed routes, and the selected route. This can be helpful for debugging route configuration issues.

---
### `Route Object`

The `Route Object` contains the information to define a route for `ViewRouter`.

> #### Syntax
```typescript
interface Route {
  path: string;
  redirect?: string;
  view?: View;
  views?: Record<string, View>;
  children?: Route[];
  [optionName: string]: any;
};
```

Props

* `path`: `string`
  * the path string description for the route match.
* `redirect`: `string` _(optional)_
  * the URL to be redirected if the route match the `path` rule.
* `view`: `View = any | (() => Promise<{ default: any, [prop: string]: any }>)` _(optional)_
  * the `View` component or a function returning the `View` component module exported as `default`.
* `views`: `Record<string, View>` _(optional)_
  * An Object of named views to be handled from a `RouterView` component.
* `children`: `Route[]` _(optional)_
  * An array of nested `Routes`.
* `meta`: `Record<string, any>` _(optional)_
  * Any other metadata you want to pass to the `SelectedRoute`. 

The `Route` object can be extended with any other custom property which will be present in the `SelectedRoute` structure as described below:

**Example:**
```typescript
const routes: Route[] = [
  {
    path: '/home',
    view: HomeComponent,
    meta: {
      icon: 'homeIcon',
    },
  },
  {
    path: '/category/:name',
    view: CategoryComponent,
    meta: {
      icon: 'categoryIcon',
    },
    children: [
      {
        path: '/product/?:id',
        view: ProductComponent,
      }
    ],
  },
  {
    path: '/',
    redirect: '/home',
  },
];
```
> #### Parameters
The parameters declared in the roue `path` will be present in the `SelectedRoute` structure described below under the property `params`.
| Syntax                  | Meaning                          | Example Path                  | Resulting Params |
|-------------------------|----------------------------------|-------------------------------|------------------|
| `:name`                 | Required parameter               | `/user/john`                  | `{ name: 'john' }` |
| `?:surname`             | Optional parameter               | `/user/john` or `/user/john/doe` | `{ name: 'john', surname?: 'doe' }` |
| `:surname?`             | Optional parameter (alternative) | `/user/john` or `/user/john/doe` | `{ name: 'john', surname?: 'doe' }` |
| `*slug`                 | Catch-all (rest) parameter       | `/user/john/profile/edit`     | `{ name: 'john', slug: ['profile', 'edit'] }` |
| `?*slug`                | Optional catch-all               | `/user/john` or `/user/john/a/b` | `{ name: 'john', slug?: [...] }` |
| `*slug?`                | Optional catch-all (alternative) | `/user/john` or `/user/john/a/b` | `{ name: 'john', slug?: [...] }` |


When the browser URL will match one of the `Routes`, the `SelectedRoute` will be available in the `router.currentRoute` property having this structure:

```typescript
interface SelectedRoute {
  parent: SelectedRoute | boolean;
  regex: RegExp;
  path: string;
  params: RouteParams;
  searchParams: URLSearchParams;
  setSearchParams: (params: URLSearchParams) => void;
  hash: string;
  setHash: (hash?: string) => void;
  views: Record<string, View>;
  meta: RouteMetadata;
  child: SelectedRoute | boolean;
}
```
In the example above the `icon` property will be present in the meta properties, (`router.currentRoute.meta.icon`).

### Router mediator hooks

These hooks are meant to be used inside mediator functions (see the [Mediator](#mediator) section in [Global Context](#global-context) for the full pattern and examples used by all `@pastweb` components).

The router must be registered in the context under `ROUTER_CONTEXT_KEY` (usually done at the root) before mediators that use these hooks are executed.

#### `useRouter`

> #### Syntax
```typescript
function useRouter(): ViewRouter;
```

Returns the `ViewRouter` that was previously set in the current mediator context.

**Example — inside a route mediator**

```typescript
import { useRouter, reactive, effect } from '@pastweb/tools';

export function myMediator(props: any, extras: any) {
  const router = useRouter();

  const state = reactive({
    loading: true,
    data: null,
  });

  // React to location changes
  effect(() => {
    if (router.location.pathname === '/dashboard') {
      loadData();
    }
  });

  async function loadData() {
    state.loading = true;
    state.data = await fetchDashboardData();
    state.loading = false;
  }

  function goToSettings() {
    router.navigate('/settings');
  }

  return { state, goToSettings };
}
```

#### `useLocation`

> #### Syntax
```typescript
function useLocation(): Location;
```

Returns a **reactive** `Location` object (stable transparent readonly proxy powered by `computed` over the router's location).

All accesses (e.g. `location.pathname`) are tracked and stay fresh. This is the recommended way to consume location inside mediators because you can capture the returned object and safely attach effects to individual properties without stale values. Leverages the object-shaped computed support (direct access, no manual sync or `.value` wrapper).

Returns
* `Location`
  * Reactive location with `pathname`, `searchParams`, `hash`, etc.

**Example:**
```typescript
import { effect, reactive, useLocation, useRouter } from '@pastweb/tools';

export function myMediator(props: any, extras: any) {
  const router = useRouter();
  const location = useLocation();   // reactive proxy

  const state = reactive({
    showMobileMenu: false,
    currentSection: 'home',
  });

  // This effect will re-run on every location change
  effect(() => {
    const { pathname } = location;

    state.currentSection = pathname.split('/')[1] || 'home';

    // close mobile menu on navigation (very common pattern)
    if (pathname !== '/') {
      state.showMobileMenu = false;
    }
  });

  function toggleMobileMenu() {
    state.showMobileMenu = !state.showMobileMenu;
  }

  return { state, toggleMobileMenu };
}
```

#### `useNavigate`

> #### Syntax
```typescript
function useNavigate(): (path: string, state?: any) => Promise<void>;
```

Returns the `navigate` function from the current `ViewRouter` instance (obtained via `useRouter`).

This is a convenience hook for performing navigation from within a mediator without needing to access the full router.

Returns
* `(path: string, state?: any) => Promise<void>`
  * The navigate function from the router.

**Example — using navigate inside a mediator**

```typescript
import { useNavigate, useRouter, reactive, effect } from '@pastweb/tools';

export function myMediator(props: any, extras: any) {
  const navigate = useNavigate();
  const router = useRouter(); // if other router APIs are needed

  const state = reactive({
    isSubmitting: false,
  });

  async function handleSubmit(formData: any) {
    state.isSubmitting = true;
    // ... do some work
    await navigate('/success', { from: 'form' });
  }

  return { state, handleSubmit };
}
```

#### `usePaths`

> #### Syntax
```typescript
function usePaths(filter?: FilterDescriptor): Readonly<Route[]>;
```

Returns the (optionally filtered) list of routes as a reactive readonly array (a transparent proxy powered by `computed` under the hood).

You use the result directly as an array (`paths.length`, `paths.map(...)`, `paths.some(...)` etc.). All property accesses and iterations are tracked.

The hook accepts the same `FilterDescriptor` as the standalone `filterRoutes` utility. The array is powered by `computed`, so it automatically stays up-to-date when routes are added (via `addRoute`) or when the filter changes.

This is the recommended way to consume the route list inside mediators when you want to react to it (for menus, etc.) without capturing stale arrays. It follows the same direct reactive shape as other updated mediator hooks and `router.paths`.

Parameters
* `filter`: `FilterDescriptor` _(optional)_
  * Same shape as for `filterRoutes`.

Returns
* `Readonly<Route[]>` (reactive array proxy)
  * The current (filtered) routes. Use it directly.

**Example:**
```typescript
import { effect, reactive, usePaths, useRouter } from '@pastweb/tools';

export function myMediator(props: any, extras: any) {
  const paths = usePaths({ meta: { visibleInMenu: true } });
  const router = useRouter();

  const state = reactive({
    menuItems: [] as Route[],
  });

  effect(() => {
    state.menuItems = paths;
  });

  function navigateTo(path: string) {
    router.navigate(path);
  }

  return { state, navigateTo };
}
```

#### `useRoute`

> #### Syntax
```typescript
function useRoute(): SelectedRoute;
```

Returns a reactive `SelectedRoute` object that remains in sync with the router's current route.

This hook is intended to be called from within a mediator function. It returns a stable transparent readonly proxy (via `computed`) over the router's current route. All property accesses are tracked and stay up to date automatically when the current route changes.

This allows safe capture of the route object from a mediator and reactive observation of its properties (using the new object computed proxy support):

```typescript
const route = useRoute();
effect(() => {
  console.log('Current path:', route.path);
});
```

Parameters
* None.

Returns
* `SelectedRoute` (reactive object)
  * `path`, `params`, `searchParams`, `hash`, `meta`, `views`, `isActive`-related fields, `setSearchParams`, `setHash`, `parent`, `child`, etc.

**Example:**
```typescript
import { effect, reactive, useRoute } from '@pastweb/tools';

export function myMediator(props: any, extras: any) {
  const route = useRoute();   // reactive proxy

  const state = reactive({
    currentPath: '',
    title: '',
  });

  // This effect will re-run on every route change
  effect(() => {
    state.currentPath = route.path;
    state.title = route.meta?.title || route.path;
  });

  return { state };
}
```

---

#### `useRouterLink`

> #### Syntax
```typescript
function useRouterLink(options: RouterLinkOptions): RouterLink;
```

Returns a reactive `RouterLink` object (stable transparent proxy via `computed` over the link descriptor computed from current location + options).

`isActive`, `isExactActive`, `pathname`, and `navigate` are kept fresh automatically. Recommended for mediators needing reactive link state (direct property access, no manual subscription or `.value`). Uses the updated object computed support.

Parameters
* `options`: `RouterLinkOptions`
  * `path`: `string`
    * The target path (may contain `:param` placeholders).
  * `params`: `Record<string, string | number | boolean | null | undefined>` _(optional)_
    * Values for the placeholders.
  * `searchParams`: `URLSearchParams` _(optional)_
    * Query string to append.
  * `hash`: `string` _(optional)_
    * Hash fragment to append.

Returns
* `RouterLink` (reactive object)
  * `pathname: string` — The final resolved path with params/search/hash applied.
  * `isActive: boolean` — True if the current location matches the link (non-exact).
  * `isExactActive: boolean` — True if the current location exactly matches the link.
  * `navigate: (to?: string) => void` — Convenience method to navigate to this link (or an override).

**Example:**
```typescript
import { effect, reactive, useRouterLink } from '@pastweb/tools';

export function myMediator(props: any, extras: any) {
  const home = useRouterLink({ path: '/' });
  const about = useRouterLink({ path: '/about' });

  const state = reactive({
    homeActive: false,
    aboutActive: false,
  });

  effect(() => {
    // Re-runs automatically when the current route changes
    state.homeActive = home.isActive;
    state.aboutActive = about.isActive;
  });

  return { state };
}
```

---

#### `useSearchParams`

> #### Syntax
```typescript
function useSearchParams(): {
  params: URLSearchParams;
  setSearchParams: (searchParams: URLSearchParams) => void;
};
```

Returns a reactive object containing the current search params (`params`) and the `setSearchParams` function from the router.

`params` is derived via `computed` (transparent proxy to the current URLSearchParams, or the real instance for API compat). Changes due to navigation or `setSearchParams` are automatically reflected (tracked accesses). The setter is the router's (updates URL + refreshes).

This is the recommended way to read/write query parameters reactively from inside mediators (uses updated computed support, no manual internal effect for the data).

Returns
* `{ params: URLSearchParams; setSearchParams: (searchParams: URLSearchParams) => void }`
  * `params` — The current `URLSearchParams` (updated reactively on location changes).
  * `setSearchParams` — Function to set new search params (updates the URL via navigation).

**Example — reading and updating search params inside a mediator**

```typescript
import { useSearchParams, useRouter, effect } from '@pastweb/tools';

export function myMediator(props: any, extras: any) {
  const search = useSearchParams();

  const state = reactive({
    filter: '',
  });

  effect(() => {
    // Re-runs whenever search params change
    state.filter = search.params.get('filter') || '';
  });

  function setFilter(value: string) {
    const next = new URLSearchParams(search.params);
    next.set('filter', value);
    search.setSearchParams(next);
  }

  return { state, setFilter };
}
```

---

### `filterRoutes`

The `filterRoutes` function filters a list of routes based on specified criteria. It allows you to filter out routes that do not meet the conditions defined in the provided filter descriptor.

> #### Syntax
```typescript
function filterRoutes(routes: Route[] = [], filter: FilterDescriptor = {}): Route[];
```

Parameters
* `routes`: `Route[] (default: [])`
  * An array of route objects to be filtered. Each Route object represents a route in the application and may contain properties such as path, component, redirect, children, and others.
* `filter`: `FilterDescriptor`
  * An object describing the filter criteria. The keys in this object represent the properties of the Route objects to filter on, and the values are the criteria that those properties must match. The value can be a specific value to match or a function that returns a boolean indicating whether the route matches the criteria.

Returns
* `Route[]`:
  * An array of Route objects that match the filter criteria. If a route has children, the function will recursively filter them based on the same criteria. If no routes match, an empty array is returned.

**Example:**
```typescript
import { filterRoutes, type Route } from '@pastweb/tools';

const routes: Route[] = [
  { path: '/home', component: HomeComponent },
  { path: '/about', component: AboutComponent, hideInPaths: true },
  { path: '/user/:id', component: UserComponent },
];

const filter = { component: HomeComponent };

const filteredRoutes = filterRoutes(routes, filter);
console.log(filteredRoutes); 
// Outputs: [{ path: '/home', component: HomeComponent }]
```
---

### `routeDive`

The `routeDive` function is designed to traverse a nested route structure and return the route found at a specified depth.
This is useful in scenarios where routes have nested children, and you need to access a route at a certain level within that hierarchy.

> #### Syntax
```typescript
function routeDive(route: SelectedRoute, depth: number): SelectedRoute;
```

Parameters
* `route`: `SelectedRoute`
  * The initial `SelectedRoute` object representing the current route from which the traversal begins. This route may contain nested child routes.
* `depth`: `number`
  * The number of levels to traverse into the nested route structure. A depth of 0 returns the initial route, while a higher depth traverses deeper into the nested child routes.

Returns
* `SelectedRoute`:
  * The `SelectedRoute` object located at the specified depth. If the specified depth exceeds the available levels of nesting, the function returns the deepest child route available.

**Example:**
```typescript
import { routeDive, type SelectedRoute } from '@pastweb/tools';

const currentRoute: SelectedRoute = {
  path: '/parent',
  child: {
    path: '/parent/child',
    child: {
      path: '/parent/child/grandchild',
    },
  },
};

const grandchildRoute = routeDive(currentRoute, 2);
console.log(grandchildRoute.path); // Output: '/parent/child/grandchild'
```

Edge Cases
* `Zero Depth`:
  * If the `depth` parameter is `0`, the function returns the initial route without any traversal.
`Exceeding Depth`:
  * If the specified `depth` is greater than the actual number of nested levels, the function returns the last available `child` route.

Practical Use Cases
* `View Rendering`:
  * In a UI framework where different views are rendered based on the current route, `routeDive` can be used to determine which nested route corresponds to the current view depth.
* `Breadcrumb Navigation`:
  * For generating breadcrumb navigation, `routeDive` can help in identifying the route at different levels, enabling dynamic breadcrumb creation.

Example of Nested Route Traversal
Given a route structure with multiple levels of nesting, routeDive will traverse through each level until it either reaches the specified depth or the deepest available route. This allows developers to dynamically access deeply nested routes without manually iterating through each level.

---

## String functions

### `camelize`

The camelize function converts a string to camel case, transforming the string by splitting it based on multiple separators such as hyphens, underscores, and spaces, and then capitalizing the first letter of each subsequent word while making the first letter of the string lowercase.

> #### Syntax
```typescript
function camelize(text: string): string;
```
Parameters
* `text`: `string`
  * The string that you want to convert to camel case. The string can contain words separated by hyphens (-), underscores (_), or spaces ( ).

Returns
* `string`
  * The input string converted to camel case. In camel case, the first letter of the string is lowercase, and each subsequent word starts with an uppercase letter, with no separators.

**Example:**
```typescript
import { camelize } from './camelize';

const result1 = camelize('hello-world');  // 'helloWorld'
const result2 = camelize('my_function_name');  // 'myFunctionName'
const result3 = camelize('This is a test');  // 'thisIsATest'
```
---

### `createIdCache`

The `createIdCache` function provides a mechanism for managing unique IDs within different named scopes.
This is particularly useful for applications where IDs need to be unique within specific contexts, such as in DOM elements, database entries, or other resources identified by a combination of scope and ID.

> #### Syntax
```typescript
function createIdCache(): IdCache;
```

Returns
* `IdCache`:
  * An object with methods to manage IDs within scopes. The methods available are:
    * `getId(scopeName: string, prefix?: string): string`
      * Generates and retrieves a unique ID for a specified scope.
    * `removeId(scopeName: string, id: string): void`
      * Removes a specific ID from a given scope.
    * `has(scopeName: string, id: string): boolean`
      * Checks if a specific ID exists within a given scope.

**Example:**
```typescript
import { createIdCache } from '@pastweb/tools';

const idCache = createIdCache();

// Generate and retrieve an ID within 'scope1'
const id1 = idCache.getId('scope1', 'prefix');
console.log(idCache.has('scope1', id1)); // true

// Remove the ID from 'scope1'
idCache.removeId('scope1', id1);
console.log(idCache.has('scope1', id1)); // false
```

Use Cases
* `Component IDs`:
  * In UI frameworks where components may need unique identifiers, particularly within specific contexts or parent components.
* `Data Management`:
  * Ensuring unique keys in data storage or retrieval processes where keys are scoped to specific datasets or categories.
* `Session Management`:
  * Managing session IDs or tokens that are unique within certain user or application sessions.

Notes
* `Performance`:
  * The use of `Set` ensures efficient lookups, insertions, and deletions, making the cache suitable for high-performance applications.
* `Immutability`:
  * The returned `IdCache` object is frozen using `Object.freeze`, preventing further modifications to its structure, which helps avoid accidental changes or bugs.

---

### `hashID`

Generates a random "friendly" ID.

If a `cache` (array or Set) is provided, it will repeatedly generate IDs until it finds one that is not present in the cache, up to a configurable number of `retries`. This is useful when you need IDs that are unique within a known set.

If no cache is provided, it simply returns a randomly generated ID (no uniqueness guarantee — it is up to the caller to ensure uniqueness if required).

> #### Syntax
```typescript
function hashID(cache?: string[] | Set<string> | null, options?: HashIDOptions): string;
```

Parameters
* `cache`: `string[] | Set<string> | null` _(optional)_
  * A list (array or Set) of existing IDs that the generated ID must not collide with. If omitted or `null`, a random ID is returned immediately without any uniqueness check.
* `options`: `HashIDOptions` _(optional)_
  * Configuration for ID generation:
    * `alphabet?: string` — Characters to use when building the ID. Default is a 62-character alphanumeric set (visually distinct, with some letters removed to reduce accidental profanity).
    * `prefix?: string` — String to prepend to every generated ID.
    * `idLength?: number` — Length of the random portion of the ID (default: `8`).
    * `retries?: number` — Maximum number of generation attempts when a `cache` is supplied (default: `9999`).

Returns
* `string`
  * A generated ID. When a `cache` is provided and no unique ID is found after exhausting retries, the last generated ID (which may collide) is returned and a console error is logged.

**Example:**
```typescript
import { hashID } from '@pastweb/tools';

// Simple random ID (no cache → no uniqueness guarantee)
const id = hashID();
console.log(id); // e.g. "_a3f9k2p7"

// Unique ID against an existing cache
const used = ['_abc12345', '_def67890'];
const unique = hashID(used, { prefix: 'user-', retries: 10, idLength: 6 });
console.log(unique); // e.g. "user-_x7k9p2" (guaranteed not in `used`)
```

**Use Cases**
* `DOM Element IDs`:
  * Generating unique `id` attributes for dynamically created elements.
* `Client-side Caches / Stores`:
  * Creating collision-resistant keys when you maintain a local list of existing IDs.
* `Temporary Identifiers`:
  * Quick friendly IDs for UI components, logs, or in-memory objects.

**Notes**
* The generated IDs always start with `_` (unless a `prefix` is supplied) followed by characters from the alphabet.
* For more advanced use cases (scoped/namespaced caches with `getId`/`has`/`removeId` methods), see the separate [`createIdCache`](#createidcache) utility.
* Using a `Set` for the cache gives the best performance for large collections.

---

### `kebabize`

The `kebabize` function converts a `camelCase` or `PascalCase` string into a `kebab-case` string.
This transformation is useful for converting JavaScript-style identifiers into formats commonly used in URLs, CSS class names, or other contexts where lowercase hyphenated strings are preferred.

> #### Syntax
```typescript
function kebabize(str: string): string;
```

Parameters
* `str`: `string`
  * The input string to be converted to `kebab-case`. This string can be in `camelCase`, `PascalCase`, or a mix of lowercase and uppercase letters.

Returns
* `string`:
  * The converted string in `kebab-case`, where each uppercase letter is replaced by a lowercase letter preceded by a hyphen (`-`). If the input contains numbers or hyphens, they are preserved in the output string without modification.

**Example:**
```typescript
import { kebabize } from '@pastweb/tools';

// Converts a camelCase string to kebab-case
const camelCaseString = kebabize('myVariableName');
console.log(camelCaseString); // Output: 'my-variable-name'

// Converts a PascalCase string to kebab-case
const pascalCaseString = kebabize('MyVariableName');
console.log(pascalCaseString); // Output: 'my-variable-name'

// Converts a string with numbers to kebab-case
const stringWithNumbers = kebabize('myVariableName2');
console.log(stringWithNumbers); // Output: 'my-variable-name2'
```

Use Cases
* `CSS Class Names`:
  * Converting JavaScript-style identifiers into CSS class names, which often follow the kebab-case convention.
* `URLs and Slugs`:
  * Generating SEO-friendly URLs or slugs by transforming human-readable names or titles into a consistent lowercase hyphenated format.
* `Configuration Keys`:
  * Converting configuration option names to a more standardized format when using tools or APIs that prefer kebab-case.

Notes
* `Performance Considerations`:
  * The function efficiently handles strings of varying lengths and character combinations. However, since it iterates through each character, performance could be impacted for extremely long strings.
* `Special Characters`:
  * The function is designed to handle standard alphanumeric characters and hyphens. It does not process or alter special characters outside of these, preserving them in their original form.

Edge Cases
* `Empty Strings`:
  * If an empty string is passed as input, the function will return an empty string.
* `Single Character Strings`:
  * For single character strings, the function will return the character in lowercase if it's an uppercase letter.

---

## Styles

This library provide a micro, general styling system written and prodived in `scss`. To be able to use it you need to install and configure [sass](https://www.npmjs.com/package/sass) for your build chain tool.
You can check [here](https://vitejs.dev/config/shared-options.html#css-preprocessoroptions) for Vite or [here](https://webpack.js.org/loaders/sass-loader/) for webpack.
The best way to setup your progect is to create a main `scss` file and let it auto import/use from `sass` in each other sass module.

### `setup`
The code below is the general way to setup a project:
```md
src/lib
      └ _index.scss
      └ css-variables.scss
      └ document.scss
      └ variables.scss
```

```scss
// ./src/styles/_index.scss
@forward '@pastweb/tools/styles/mixins';
@forward './variables';
```
```js
// sass config
...
{
  additionalData: `@use "./src/styles";`,
}
...
```
```scss
// ./src/styles/variables.scss
@forward '@pastweb/tools/styles/variables';

// Here you can write your custom variables
```
```scss
// ./src/styles/css-variables.scss
@forward '@pastweb/tools/styles/css-variables';

// Here you can import other css-variables or add different color-scheme
```
```scss
// ./src/styles/document.scss
@use './css-variables';
@use '@pastweb/tools/styles/document';
```

The `./src/styles/document.scss` file is the moduse to be used in your main js/ts file:


* [@pastweb/tools/styles/variables.scss](https://github.com/pastweb/tools/blob/master/src/styles/variables.scss) _(mandatory)_
  * contains the sass variables you can customise in your `./src/styles/variables.scss` file for your project using the `with` sass clausule.
* [@pastweb/tools/styles/mixins.scss](https://github.com/pastweb/tools/blob/master/src/styles/mixins.scss)
  * contains media variables and query mixins.
* [@pastweb/tools/styles/document.scss](https://github.com/pastweb/tools/blob/master/src/styles/document.scss)
  * contains the [minireset](https://github.com/jgthms/bulma/blob/master/sass/base/generic.sass) and use the `sass` and `css` you can customize with the `with` sass clausule.


The `document.variables.scss` exports the `sass` variables as `css variables` using the same variable name convention.
This is in case you want to implement a different `color scheme` for your project as in the example below:

```scss
// ./src/styles/css-variables.scss
@forward '@pastweb/tools/styles/css-variables';

$background-color_dark: black;
$color_text_dark: white;

@media (prefers-color-scheme: dark) {
  :root {
    --background-color: #{ $background-color_dark };
    --color_text: #{ $color_text_dark };
  }
}
```

In this case don't forget to add the `<meta name="color-scheme" content="light dark">` inside the `<head />` tag of your html document.

### `colorFilter`

> #### Setup
```js
// sass config
import { colorFilter } from '@pastweb/tools/colorFilter';
...
{
  additionalData: `@import "./src/styles/all.scss";`,
  functions: { 'colorFilter($color)': colorFilter },
}
...
```
As you can see in the above setup, the `colorFilter` function is set to extends the `sass` functionality in order to be able to use this function inside your `sass`/`scss` code.
The `colorFilter` function is a typescript porting of [this](https://codepen.io/sosuke/pen/Pjoqqp) public code and allow to set the color of an `svg` file if imported in your code inside a `<img />` tag.

**Example:**
```scss
i {
  img {
    filter: colorFilter($color);
  }
}
```

### `Responsiveness mixins`

There are few mixins tools available for handle the responsivness of your application you can use as in the examples below:

```scss
@include mobile {
  background-color: green;
}

@include from(640px) {
  background-color: red;
}
```
you can check the full list of mixins [here](https://github.com/pastweb/tools/blob/master/src/styles/mixins.scss).

### `flex-layout`

The file [flex-layout.scss](https://github.com/pastweb/tools/blob/master/src/styles/flex-layout.scss) defines few simple `flexbox` based utilities to help designing a layout. It is totally optional to be used and is available even under `module` extension if want to be used with CSS Modules (`flex-layout.module.scss`).
These utilities are not made with the idea to be used in a component library, but for marco components aimed for component positioning layout-wise.
Below the utility list:

#### `Flex direction`
| Class	| Property: Value |
|---|---|
| row, flex	| flex-direction: row; |
| reverse | flex-direction: row-reverse; |
| column | flex-direction: column; |
| reverse	| flex-direction: column-reverse; |


#### `Flex wrap`
| Class	| Property: Value |
|---|---|
| wrap	| flex-wrap: wrap; |
| wrap-reverse | flex-wrap: wrap-reverse; |
| no-wrap | flex-wrap: nowrap; white-space: nowrap; |

#### `Flex justify`
| Class	| Property: Value |
|---|---|
| justify-center | justify-content: center; |
| justify-start | justify-content: flex-start; |
| justify-end | justify-content: flex-end; |
| justify-left | justify-content: left; |
| justify-right | justify-content: right; |
| justify-around | justify-content: space-around; |
| justify-between | justify-content: space-between; |
| justify-everly | justify-content: space-evenly; |
|justify-stretch | justify-content: stretch; |

#### `Flex align`
| Class	| Property: Value |
|---|---|
| align-center | align-items: center; |
| align-stretch | align-items: stretch; |
| align-start | align-items: flex-start; |
| align-end | align-items: flex-end; |
| align-baseline | align-items: baseline; |

#### `Flex centered`
| Class	| Property: Value |
|---|---|
| centered | display: flex; justify-content: center; align-items: center; |

#### `Full size`
| Class	| Property: Value |
|---|---|
| full-width | width: 100%; |
| full-height | height: 100%; |

#### `Flex grow`
| Class	| Property: Value |
|---|---|
| grow-0	| flex-grow: 0; |
| grow-1 | flex-grow: 1; |
| grow-2 | flex-grow: 2; |
| grow-3 | flex-grow: 3; |
| grow-4 | flex-grow: 4; |
| grow-5 | flex-grow: 5; |


#### `Flex shrink`
| Class	| Property: Value |
|---|---|
| shrink-0 | flex-shrink: 0; |
| shrink-1 | flex-shrink: 1; |
| shrink-2 | flex-shrink: 2; |
| shrink-3 | flex-shrink: 3; |
| shrink-4 | flex-shrink: 4; |
| shrink-5 | flex-shrink: 5; |

---

## Utility functions

### Environment detection constants (`envs`)

The `envs` module provides a set of boolean constants for detecting the current runtime environment.

**Available constants:**
- `isBrowser`: `true` when running in a browser environment (has `window` and `document`).
- `isNode`: `true` when running in Node.js.
- `isDeno`: `true` when running in Deno.
- `isBun`: `true` when running in Bun.
- `isServer`: `true` when running in any server-side JavaScript runtime (Node.js, Deno, or Bun).
- `isReactNative`: `true` when running in React Native.
- `isCapacitor`: `true` when running inside a Capacitor app.
- `isNativeScript`: `true` when running inside a NativeScript app.
- `isElectron`: `true` when running inside Electron.

**Example:**
```typescript
import { isBrowser, isServer, isCapacitor } from '@pastweb/tools';

if (isServer) {
  console.log('Running on the server');
} else if (isCapacitor) {
  console.log('Running inside Capacitor');
} else if (isBrowser) {
  console.log('Running in the browser');
}
```

---

### `memo`

The `memo` function is a higher-order utility that enables memoization of another function. Memoization is a performance optimization technique that caches the results of expensive function calls and reuses the cached result when the same inputs occur again. This can significantly reduce the time complexity of certain operations, especially in scenarios where the function is called repeatedly with the same arguments.

> #### Syntax
```typescript
function memo(func: MemoCallback): (...args: any[]) => any;
```

Parameters
* `func`: `MemoCallback`
  * The function to be memoized. This function will be executed normally the first time it is called with a set of arguments, and its result will be stored in a cache for future reuse.

Returns
* `Function`:
  * A memoized version of the provided function. When this memoized function is called, it first checks the cache to see if the result for the given arguments has already been computed. If it has, the cached result is returned; otherwise, the function is executed, and the result is stored in the cache for future calls.

**Example:**
```typescript
import { memo } from '@pastweb/tools';

function complexCalculation(a: number, b: number): number {
  console.log('Computing...');
  return a + b;
}

const memoizedCalculation = memo(complexCalculation);

console.log(memoizedCalculation(1, 2)); // Logs: 'Computing...' then '3'
console.log(memoizedCalculation(1, 2)); // Logs: '3' (no 'Computing...' since the result is cached)
console.log(memoizedCalculation(2, 3)); // Logs: 'Computing...' then '5'
console.log(memoizedCalculation(2, 3)); // Logs: '5' (cached result)
```

Use Cases
* `Expensive Calculations`:
  * Memoization is especially useful for functions that perform expensive calculations or operations, such as those involving complex algorithms or large data processing.
* `Recursive Functions`:
  * Memoization can be used to optimize recursive functions by avoiding redundant calculations of the same results.
* `Pure Functions`:
  * Memoization works best with pure functions, which always produce the same output for the same input and have no side effects.

Performance Considerations
* `Memory Usage`:
  * The cache grows with each unique set of arguments, so it is important to be mindful of the potential memory usage. In some cases, it may be necessary to implement a cache eviction strategy to prevent unbounded growth.
* `Equality Check`:
  * The function uses strict equality (`===`) to compare arguments. If the arguments are complex objects, you may need to ensure that identical objects are passed in the same reference, or else the memoization may not work as intended.

Edge Cases
* `Non-Primitive Arguments`:
  * Since the function uses strict equality for comparisons, if non-primitive values (like objects or arrays) are passed as arguments, the memoization might not work as expected unless the same object references are used.
* `Variadic Functions`:
  * The memo function can handle variadic functions (functions with a variable number of arguments) since it operates on args as an array.

Notes
* `Side Effects`:
  * Memoization should not be used with functions that produce side effects, as the function may not execute every time, potentially leading to inconsistent states.

---

### `noop`

The `noop` function is a utility function that performs no operations (no-op) and returns `undefined`.
It is commonly used as a placeholder function or as a default callback when no specific behavior is required.

> #### Syntax
```typescript
function noop(...args: any[]): any;
```

Parameters
* `...args`: `any[]`
  * A variable number of arguments that can be passed to the function. These arguments are ignored and have no effect on the function's behavior.

Returns
* `any`:
  * The function does not perform any operations and always returns `undefined`.

**Example:**
```typescript
import { noop } from '@pastweb/tools';

function exampleFunction(callback = noop) {
  // Some operation
  callback();
}

exampleFunction(); // No operation is performed by the callback
exampleFunction(() => console.log('Callback called')); // Logs 'Callback called'
```
---

## License

This project is licensed under the [MIT License](LICENSE).

© 2026 Domenico Pasto
