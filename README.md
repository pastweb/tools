# @pastweb/tools

Contains a collection of utility functions to help with various common tasks in JavaScript and TypeScript application development.
Below you will find descriptions of each function along with examples of how to use them.

* Production ready
* Treeshake optimised

## Installation
```bash
$ npm i -S @pastweb/tools
```
```bash
$ pnpm i -S @pastweb/tools
```
```bash
$ yarn add -S @pastweb/tools
```

## Summary

- [Async functions](#async-functions)
  - [createApiAgent](#createapiagent)
    - [useQuery](#usequery)
    - [useMutation](#usemutation)
  - [createAsyncStore](#createasyncstore)
    - [normalizeAsyncQueue](#normalizeasyncqueue)
  - [createAsyncMicroSrote](#createasyncmicrostore)
  - [createEventEmitter](#createeventemitter)
  - [createLangAsyncStore](#createlangasyncstore)
  - [debounce](#debounce)
  - [throttle](#throttle)
- [Browser functions](#browser-functions)
  - [createMatchDevice](#creatematchdevice)
  - [createMatchScheme](#creatematchscheme)
    - [createMatchSchemeAsyncStore](#creatematchschemeasyncstore)
  - [createStorage](#createStorage)
  - [createViewRouter](#createviewrouter)
    - [Route Object](#route-object)
    - [filterRoutes](#filterroutes)
    - [routeDive](#routedive)
- [Date and Time](#date-and-time)
  - [isDateYoungerOf](#isdateyoungerof)
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
  - [update](#update)
  - [withDefaults](#withdefaults)
- [Reactivity](#reactivity)
  - [reactive](#reactive)
  - [ref](#ref)
  - [effect](#effect)
  - [computed](#computed)
  - [createMicroStore](#createmicrostore)
  - [createMircoStoreCollector](#createmicrostorecollector)
- [String functions](#string-functions)
  - [camelize](#camelize)
  - [createIdCache](#createidcache)
  - [hashID](#hashid)
  - [kebabize](#kebabize)
- [Utility functions](#utility-functions)
  - [memo](#memo)
  - [noop](#noop)
  - [isSSR](#isssr)
- [Styles](#styles)
  - [setup](#setup)
  - [colorFilter](#colorfilter)
  - [Responsiveness mixins](#responsiveness-mixins)
  - [flex-layout](#flex-layout)

---
## Async functions

### `createApiAgent`

Creates an API agent with customizable settings for HTTP requests.

> #### Syntax
```typescript
function createApiAgent(settings?: AgentSettings): Agent;
```
Parameters
* `settings`: `AgentSettings` _(optional)_ The settings for the API agent.
  * `withCredentials`: `boolean` _(optional)_ (default: false)
    * Indicates whether cross-site Access-Control requests should be made using credentials.
  * `headers`: `Record<string, any>` _(optional)_ (default: {})
    * Custom headers to be sent with each request.
  * `exclude`: `string | RegExp | Array<string | RegExp>` _(optional)_
    * URLs or patterns to exclude from request intercepting.
  * `onGetValidToken`: `() => Promise<Record<string, any>>` _(optional)_
    * Function to get a valid token for authorization.
  * `onUnauthorizedResponse`: `() => void` _(optional)_
    * Callback for unauthorized responses.
  * `pagination`: `boolean | Pagination` _(optional)_ (default: `true`)
    * Enables pagination parsing. If `true`, uses default settings (`{ defaultPageLimit: 100, header: 'Content-Range' }`).
      If an object, allows custom `defaultPageLimit` and `header`.
  * `cache`: `boolean` _(optional)_ (default: `false`)
    * Enables response caching for GET requests.

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
  * Sends a DELETE request. Supports `AxiosRequestConfig` and `onSuccess`/`onError` callbacks  if `cache = true` in the `AgentOptions`.
* `get<T = any>(url: string, options: QueryOptions): Promise<AxiosResponse<T>>`
  * Sends a GET request. Supports `AxiosRequestConfig` and caching with `queryKey` and `expireIn` if `cache = true` in the `AgentOptions`.
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
When cache: `true` is set, GET requests are cached using a `queryKey` (defaults to the URL). The cache supports:
* `get(key: string): QueryData`
  * Retrieves a cached response.
* `getAll(): [string, QueryData][]`
  * Returns all cache entries.
* `has(key: string): boolean`
  * Checks if a key exists in the cache.
* `set(key: string, data: QueryData): Map<string, QueryData>`
  * Sets a cache entry with a response, timestamp, and expiration.
* `delete(key: string): boolean`
  * Removes a cache entry.
* `invalidateQuery(queryKey?: string | string[]): void`
  * Invalidates cache entries by key or prefix.

Cache entries expire based on the `expireIn` option (e.g., `'1s'`, `'5m'`) using the [`isDateYoungerOf`](#isdateyoungerof) utility.

Pagination
When `pagination` is enabled, the `successResponseInterceptor` processes responses with a `Content-Range` header (e.g., `0-1/20` where `0-1` is start and end index adn `20` is the items total number).
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

// Cached GET Request
const agent = createApiAgent({ cache: true });
await agent.get('/api/users', { queryKey: 'users', expireIn: '5m' });
await agent.get('/api/users', { queryKey: 'users' }); // Returns cached response

// Paginated GET Request
const agent = createApiAgent({ pagination: { defaultPageLimit: 10, header: 'Content-Range' } });
const response = await agent.get('/api/users?offset0&limit=10');
// Response: { data: [...], info: { start: 0, end: 9, total: 50, size: 10, current: 1, of: 5 } }
```
---
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
  * `SSRWait` _(optional)_ (default: `true`)
    If run in server side block the thread until the `fn: () => Promise<AxiosResponse<T>>` is solved or generate an error.

Returns
* `QueryInfo<T>` A reactive object with query state and methods.
  * `data: T | null` The response data or `initialData`.
  * `pagination: Page<any>['pagination'] | null` Pagination info if available
  * `isPending: boolean` True during initial fetch or refetch.
  * `isLoading: boolean` Alias for `isPending`.
  * `isFetching: boolean` True during any fetch.
  * `isError: boolean` True if an error occurred.
  * `error: any` The error object, if any.
  * `isPlaceholderData: boolean` True if `data` is `initialData`.
  * `fetch: () => Promise<void>` Manually triggers the query.

The `useQuery` function creates a reactive query that automatically fetches data when initialized (if `immediate` is `true`) or when reactive dependencies in `source` or `immediate` (if a `Ref`) change. It integrates with `createApiAgent` to handle reactive `AxiosResponse` objects, ensuring `data` updates with new responses or cache changes. The `source` parameter is required to track reactive variables used in `fn` (e.g., `page.value` in the `URL`).

Example:
```typescript
import { createApiAgent, createQuery, ref } from '@pastweb/tools';

// Create an API agent
const agent = createApiAgent({
  cache: true,
  pagination: true,
});

// Basic query with immediate fetch
const query = useQuery({
  fn: () => agent.get('/api/users?_page=1&_limit=10'),
});

console.log(query.data); // Initially null, updates to { data: [...], info: {...} }
console.log(query.isPending); // true during fetch, then false

// Query with reactive dependency
const page = ref(1);
const reactiveQuery = useQuery({
  fn: () => agent.get(`/api/users?_page=${page.value}&_limit=10`),
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
  Initial data to set before the first mutation. Sets `isPlaceholderData` to t`rue` until a mutation completes.

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
const createUser = createMutation({
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
import { normalizeAsyncQueue } from '@pastweb/tools';

// Single promise
const singlePromise = Promise.resolve('done');
normalizeAsyncQueue(singlePromise); // [singlePromise]

// Array of promises and functions
const promise1 = Promise.resolve('done');
const promise2 = () => Promise.resolve('done');
normalizeAsyncQueue([promise1, promise2]); // [promise1, promise2()]

// Async store
const asyncStore = {
  $$asyncStore: true,
  isStoreReady: false,
  isReady: new Promise(resolve => resolve(true)),
  init: () => { asyncStore.isStoreReady = true; }
};
normalizeAsyncQueue(asyncStore); // [asyncStore.isReady]
```
Remarks
The `normalizeAsyncQueue` function is designed to handle various asynchronous operations and normalize them into a uniform array of promises. This is particularly useful when dealing with mixed asynchronous workflows, ensuring that all operations can be awaited in a consistent manner.

This function supports:
* Promises
* Functions returning promises
* Asynchronous stores

If an asynchronous store is passed in, the function will check if the store is ready. If it is not, the `init` method of the store will be called to prepare it.

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
* Server-Side Rendering (SSR): If server-side rendering is detected (isSSR), user agent-based detection is used, and media query-based detection is skipped.
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

Here is the **Markdown documentation** in the same style as the "isType" function documentation:  

---

### `createMatchScheme`

> #### Syntax 
```ts
function createMatchScheme(config?: SchemeOptions): MatchScheme;
```

## Description  

Creates a match scheme manager that allows setting and tracking the color scheme mode.  
It detects system preferences, provides methods to update the mode, and notifies listeners of changes.

## Parameters  

### `config` (optional)  
**Type:** `SchemeOptions`  
An object containing configuration options for the match scheme.

| Property       | Type      | Default  | Description |
|---------------|----------|----------|-------------|
| `defaultMode` | `string` | `"auto"` | The initial color mode: `'auto'`, `'light'`, or `'dark'`. |
| `datasetName` | `string \| false` | `false` | The dataset attribute name used to store the color scheme in the root element. If `false`, it uses CSS class names instead. |

## Returns  

**Type:** `MatchScheme`  
An object with methods to manage and listen to scheme changes.

## Methods  

#### `getInfo`  
```ts
getInfo(): { mode: string; system: string; selected: string };
```
**Description:**  
Retrieves the current color scheme information.

**Returns:**
| Property   | Type   | Description |
|------------|--------|-------------|
| `mode`     | `string` | The currently set mode (`'auto'`, `'light'`, or `'dark'`). |
| `system`   | `string` | The system's detected color scheme (`'light'` or `'dark'`). |
| `selected` | `string` | The active mode (either `mode` or the detected system scheme if `mode` is `'auto'`). |

**Example:**  
```ts
const scheme = createMatchScheme();
console.log(scheme.getInfo()); 
// { mode: 'auto', system: 'light', selected: 'light' }
```

#### `setMode`  
```ts
setMode(mode: string): void;
```
**Description:**  
Updates the color mode. If `'auto'` is selected, the mode will follow the system's preference.

**Parameters:**
| Name   | Type   | Description |
|--------|--------|-------------|
| `mode` | `string` | The new mode: `'auto'`, `'light'`, or `'dark'`. |

**Example:**  
```ts
scheme.setMode('dark'); 
console.log(scheme.getInfo()); 
// { mode: 'dark', system: 'light', selected: 'dark' }
```

#### `onModeChange`  
```ts
onModeChange(fn: (mode: string) => void): void;
```
**Description:**  
Registers a callback that is triggered when the mode changes.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `fn` | `(mode: string) => void` | A callback function that receives the new mode. |

**Example:**  
```ts
scheme.onModeChange((mode) => {
  console.log(`Mode changed to: ${mode}`);
});
scheme.setMode('light'); 
// Logs: "Mode changed to: light"
```

#### `onSysSchemeChange`  
```ts
onSysSchemeChange(fn: (mode: string) => void): void;
```
**Description:**  
Registers a callback that triggers when the system's preferred color scheme changes.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `fn` | `(mode: string) => void` | A callback function that receives the new system scheme (`'light'` or `'dark'`). |

**Example:**  
```ts
scheme.onSysSchemeChange((systemMode) => {
  console.log(`System scheme changed to: ${systemMode}`);
});
```

## Example Usage  
```ts
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

### `createMatchSchemeAsyncStore`

> #### Syntax  
```ts
function createMatchSchemeAsyncStore(options?: SchemeOptionsAsyncStore): ColorSchemeAsyncStore;
```

## Description  

Creates an asynchronous store for managing color schemes.  
This function initializes an asynchronous store specifically for handling  
color scheme preferences and system theme detection. It integrates with  
`createMatchScheme` to track and manage color mode changes.

## Parameters  

#### `options` (optional)  
**Type:** `SchemeOptionsAsyncStore`  
Configuration options for the asynchronous store.

| Property       | Type                  | Default              | Description |
|---------------|-----------------------|----------------------|-------------|
| `storeName`   | `string`               | `"ColorSchemeStore"` | The name of the store. |
| `datasetName` | `string \| false`      | `false`              | The dataset attribute name for storing the color scheme. If `false`, it uses CSS class names instead. |
| `defaultMode` | `string`               | `"auto"`             | The default mode (`'auto'`, `'light'`, or `'dark'`). |
| `initStore`   | `(matchScheme: MatchScheme) => Promise<void>` | `noop` | An asynchronous function that runs during store initialization. |

## Returns  

**Type:** `ColorSchemeAsyncStore`  
An object that provides methods and properties for managing color schemes asynchronously.

## Properties  

### `matchScheme`  
**Type:** `MatchScheme`  
Manages color scheme detection and provides methods to get or change the scheme.

#### `init`  
**Type:** `() => void`  
A no-op function for initialization.

#### `setStoreReady`  
**Type:** `() => void`  
Marks the store as ready after initialization.

## Example Usage  

```ts
const colorSchemeStore = createMatchSchemeAsyncStore({
  defaultMode: 'auto',
  datasetName: 'theme',
  initStore: async (matchScheme) => {
    console.log('Initializing with:', matchScheme.getInfo());
  }
});
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
### `createViewRouter`

The `createViewRouter` function is a core utility for managing routing in a single-page application (SPA).
It provides the ability to define routes, navigate between them, and react to route changes within the application.
The `ViewRouter` [history](https://github.com/browserstate/history.js) library covering the most common
functionalities implemented in other router UI Frameworks like [react-router](https://reactrouter.com/en/main) or [vue-router](https://router.vuejs.org/).
The goal of this implementation is to obtain a consistant set of API and terminology cross framework.

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
    * A function to execute before selecting a route, as example for the route authentication/authirization.
  * `sensitive`: boolean _(optional)_
    * If true, route matching will be case-sensitive.

Returns
* `ViewRouter`
  * An object that represents the router. This object contains properties and methods to manage routing within the application.

**Example:**
```typescript
import { createViewRouter } from '@pastweb/tools';
import { RouterView } from '@pastweb/x';

const router = createViewRouter({
  routes: [
    { path: '/', component: HomePage },
    { path: '/about', component: AboutPage },
  ],
  preloader: MyProloaderComponent,
  RouterView,
});
```

Note : `pastweb/x` is intended to be a specific framework package (react, preact, vue, svelte ...).

Core Features
* `Route Parsing and Matching`:
  * The router parses and normalizes routes, creating a structure that allows efficient matching of paths against the defined routes.
* `Event-Driven`:
  * It uses an event emitter to notify listeners about route changes or when new routes are added.
* `Navigation`:
  * The router offers methods to programmatically navigate, push, replace, or go back and forward in the history stack.
* `Base Path Management`:
  * Allows setting and managing a base path, which is useful for applications hosted under subdirectories.
* `Route Preloading`:
  * Supports route preloading, enabling efficient loading of route components.
* `Custom Hooks`:
  * Provides hooks (`beforeRouteParse`, `beforeRouteSelect`) that allow custom logic to be executed during route parsing and selection.
  
**Example:**
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
* `onRouteChange(fn: (route: SelectedRoute) => void): RemoveListener`
  * Subscribes to route change events. The provided callback function will be called whenever the route changes.
* `onRouteAdded(fn: (routes: Route[]) => void): RemoveListener`
  * Subscribes to route added events. The provided callback function will be called whenever a new route is added to the router.
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

The `Route` object can be extended with any other custom property which will be present in the `SelectedRoute` structure as described below:

**Example:**
```typescript
const routes: Route[] = [
  {
    path: '/home',
    view: HomeComponent,
    icon: 'homeIcon',
  },
  {
    path: '/category/:name',
    view: CategoryComponent,
    icon: 'categoryIcon',
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
  options: RouteOptions;
  child: SelectedRoute | boolean;
}
```
In the example above the `icon` property will be present in the options parameters, (`router.currentRoute.options.icon`).

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
  * Returns `true` if the given date is younger than the specified duration relative to the current date and time. Returns `false` otherwise.

**Example:**
```typescript
import { isDateYoungerOf } from '@pastweb/tools';

const date = new Date();
date.setDate(date.getDate() - 1); // 1 day ago
console.log(isDateYoungerOf(date, '1D')); // Output: true
console.log(isDateYoungerOf(date, '2D')); // Output: true
console.log(isDateYoungerOf(date, '12h')); // Output: false
```

Edge Cases
* `Past and Future Dates`: The function checks the date against the current date and time, so it works for both past and future dates relative to `now`.
* `Zero or Negative Durations`: If the duration components result in zero or negative values, the function will consider the date as not younger and will return `false`.

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
  * A string representing the type of the target. The returned string is one of the built-in JavaScript types (e.g., `"Object"`, `"Array"`, `"Function"`, `"String"`, `"Number"`, `"Null"`, `"Undefined"`, etc.).

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
It uses the [getType](#gettype) function to accurately determine the type of the target and compares it to the provided type string.

> #### Syntax
```typescript
function isType(type: string, target: any): boolean;
```

Parameters
* `type`: `string`
  * The type to check against. This should be a string representing the expected type of the `target`, such as `"String"`, `"Number"`, `"Array"`, `"Object"`, etc.
* `target`: `any`
  * The value whose type is to be checked. This can be any JavaScript value, such as a string, number, object, array, function, etc.

Returns
* `boolean`:
  * Returns `true` if the `target` matches the specified `type`, otherwise `false`.

**Example:**
```typescript
import { isType } from '@pastweb/tools';

console.log(isType('String', 'Hello')); // true
console.log(isType('Number', 123)); // true
console.log(isType('Array', [1, 2, 3])); // true
console.log(isType('Object', { key: 'value' })); // true
console.log(isType('Null', null)); // true
console.log(isType('Undefined', undefined)); // false
console.log(isType('Function', () => {})); // true
console.log(isType('Date', new Date())); // true
```

Use Cases
* `Type Validation`:
  * Use `isType` when you need to validate that a value is of a specific type before proceeding with further operations.
* `Conditional Logic`:
  * Helps in conditionally executing code based on the type of a variable, ensuring that the operations being performed are type-safe.
* `Form Validation`:
  * Useful in form validation scenarios where input values need to be checked against expected types before submission or processing.

---

### `proxy`

The proxy function creates a proxy object that intercepts `get`, `set`, and `delete` operations on the target object.
It invokes a callback function asynchronously after a delay whenever one of these operations occurs.
The proxy can also filter which properties trigger the callback based on the provided property keys.

> #### Syntax
```typescript
function proxy<T extends object = {}>(
  target: T,
  callback: ProxyCallback,
  ...filter: (Extract<keyof T, string> | number | symbol)[]
): T;
```

Parameters
* `target`: `T`
  * The target object that the proxy will wrap and monitor for operations.
* `callback`: `ProxyCallback`
  * A callback function that is invoked asynchronously after a property is accessed, modified, or deleted on the proxy. The callback is provided with details about the operation, including the  property name, old value, new value, and the type of action (get, set, delete).
* `filter`: `(...filter: (Extract<keyof T, string> | number | symbol)[])` _(optional)_
  * An optional list of properties (specified as strings, numbers, or symbols) to filter which properties should trigger the callback. If no filter is provided, the callback is invoked for all properties.

Returns
* `T`:
  * Returns a new proxy object that wraps the target object. This proxy will trigger the callback for the specified operations and properties.

**Example:**
```typescript
import { proxy } from '@pastweb/tools';

const obj = { a: 1, b: 2 };
const observedObj = proxy(obj, ({ action, newValue, oldValue, prop }) => {
  console.log(`Action: ${action}, Property: ${String(prop)}, New Value: ${newValue}, Old Value: ${oldValue}`);
});

observedObj.a = 3; // Logs: Action: set, Property: a, New Value: 3, Old Value: 1
delete observedObj.b; // Logs: Action: delete, Property: b, New Value: undefined, Old Value: 2
```

Description
The `proxy` function enhances an object by creating a proxy that monitors `get`, `set`, and `delete` operations. Whenever one of these operations occurs on the target object, the provided callback function is invoked asynchronously, with a slight delay (16ms). The callback is passed detailed information about the operation, including the property name, the old and new values, and the type of operation (`get`, `set`, or `delete`).

Filtering Properties
The `proxy` function allows filtering of properties that should trigger the callback. You can specify which properties (by name, number, or symbol) should trigger the callback. If no properties are specified, the callback will be invoked for all properties.

Callback Execution
The callback is executed asynchronously using `setTimeout`, which ensures that the callback is non-blocking. A weak reference (`WeakRef`) is used for the callback to avoid memory leaks, ensuring that the callback is properly garbage collected if it is no longer in use.

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

## `reactive`

The `reactive` function creates a reactive proxy for an object, enabling dependency tracking and automatic effect triggering when properties are accessed or modified. This is useful for building reactive state management systems where changes to an object's properties trigger updates in dependent computations or UI components.

> #### Syntax
```typescript
function reactive<T extends object>(obj: T, deep = false): T;
```

**Parameters**
* `obj`: `T extends object`
  * The object to make reactive. This can be any JavaScript object, such as a plain object or array.
* `deep`: `boolean` _(optional)_
  * If `true`, nested objects accessed via properties are also made reactive. Defaults to `false`.

**Returns**
* `T`
  * A reactive proxy of the input object, with the same type as the input. The proxy tracks property access and triggers effects on property changes.

**Example:**
```typescript
import { reactive, effect } from './reactivity';

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

**Use Cases**
* **State Management**:
  * Creating reactive state objects in frameworks like Vue.js or custom reactive systems, where changes to state automatically update the UI.
* **Data Binding**:
  * Enabling two-way data binding in applications by tracking property changes and updating dependent components.
* **Observable Data**:
  * Building observable data structures for real-time applications, such as dashboards or live-updating forms.

**Notes**
* **Performance**:
  * The function uses `Proxy` for reactivity, which is efficient but may have performance implications for large objects with frequent access or updates.
* **Immutability**:
  * The original object is modified to include a non-enumerable `isReactive` symbol to mark it as reactive. This property is not writable or configurable.
* **Deep Reactivity**:
  * When `deep` is `true`, nested objects are recursively made reactive, which can increase memory usage for complex object graphs.

**Edge Cases**
* **Non-Object Inputs**:
  * The function expects an object as input. Passing non-objects (e.g., primitives) will result in a TypeScript type error.
* **Circular References**:
  * Deep reactivity may cause issues with circular references, requiring careful handling to avoid infinite recursion.

---

## `ref`

The `ref` function creates a reactive reference (ref) for a single value, wrapping it in a reactive object with a `value` property. This is useful for managing reactive primitive values or simple state in reactive systems.

> #### Syntax
```typescript
function ref<T>(value: T, deep = false): { value: T };
```

**Parameters**
* `value`: `T`
  * The value to make reactive. This can be any value, including primitives (e.g., number, string) or objects.
* `deep`: `boolean` _(optional)_
  * If `true`, nested objects within the value are also made reactive when accessed. Defaults to `false`.

**Returns**
* `{ value: T }`
  * A reactive object with a single `value` property that holds the input value. The object is reactive, tracking access and triggering effects on changes.

**Example:**
```typescript
import { ref, effect } from './reactivity';

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

**Use Cases**
* **Single Value Reactivity**:
  * Managing reactive state for single values, such as counters, flags, or settings, in reactive applications.
* **Form Inputs**:
  * Binding form input values to reactive refs for real-time validation or updates.
* **State Isolation**:
  * Isolating a single piece of state in a reactive system, making it easier to manage compared to complex objects.

**Notes**
* **Performance**:
  * Refs are lightweight due to their single-property structure, but deep reactivity (when enabled) may add overhead for nested objects.
* **Immutability**:
  * The returned ref object includes a non-enumerable `isRef` symbol to mark it as a ref, which is not writable or configurable.
* **Type Safety**:
  * The generic type `T` ensures type safety for the `value` property, allowing TypeScript to enforce correct usage.

**Edge Cases**
* **Primitive vs. Object Values**:
  * The function works with both primitives and objects, but deep reactivity only applies to object values.
* **Reassignment**:
  * Reassigning the entire ref object (e.g., `count = ref(5)`) does not affect reactivity; only changes to the `value` property are tracked.

---

## `effect`

The `effect` function creates a reactive effect that runs when its dependencies change. It supports tracking dependencies from reactive objects, refs, or computed values, making it a core component of reactive systems.
If there are not dependencies specified (source), the function callback is immediatelly executed registering the dependencies automatically.
if dependencies are specified, the effect callback function will run just if any of the the dependencies changes.
if you want to run immediatelly the function you can pass "true" as third parameter.
The dependenciesrould be a function which returns the value to track of a reactive object "() => obj.a", a ref object, a reactive object itself or
an array of these.
If a reactive object is passed as dependency the function will run when any of the reactive object properties will change.

> #### Syntax
```typescript
function effect<T>(
  fn: (newVal: any | any[], oldVal: any | any[]) => void,
  source?: (() => T) | { value: T } | Record<PropertyKey, any> | Array<(() => any) | { value: any } | Record<PropertyKey, any>>,
  immediate = false
);
```

**Parameters**
* `fn`: `(newVal: any | any[], oldVal: any | any[]) => void`
  * The effect function to run when dependencies change. It receives the new and old values of the tracked source(s).
* `source`: `(() => T) | { value: T } | Record<PropertyKey, any> | Array<(() => any) | { value: any } | Record<PropertyKey, any>>` _(optional)_
  * The reactive source(s) to track. Can be a function, a ref, a reactive object, or an array of such sources. If omitted, the effect tracks all reactive dependencies accessed within `fn`.
* `immediate`: `boolean` _(optional)_
  * If `true`, the effect runs immediately upon creation. Defaults to `false`.

**Returns**
* `void`
  * The function does not return a value but sets up a reactive effect that runs when dependencies change.

**Example:**
```typescript
import { reactive, ref, effect } from './reactivity';

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

// Example with multiple sources
const source1 = ref(1);
const source2 = reactive({ x: 2 });
effect((newVal) => {
  console.log(`Sources: ${newVal[0]}, ${newVal[1].x}`);
}, [source1, source2]);
source1.value = 3; // Logs: "Sources: 3, 2"
source2.x = 4; // Logs: "Sources: 3, 4"
```

**Use Cases**
* **UI Updates**:
  * Automatically updating UI elements when reactive state changes, such as in reactive frameworks or custom rendering logic.
* **Side Effects**:
  * Performing side effects (e.g., logging, API calls) in response to changes in reactive data.
* **Dependency Tracking**:
  * Creating computed values or derived state that depend on multiple reactive sources.

**Notes**
* **Performance**:
  * The effect uses debouncing (with a 16ms delay) to optimize performance and prevent excessive re-runs during rapid updates.
* **Dependency Collection**:
  * Dependencies are automatically collected during the execution of `fn` or `source` if they are reactive (via `reactive` or `ref`).
* **Value Comparison**:
  * The effect only runs if the new value differs from the old value, with special handling for arrays to check element-wise changes.

**Edge Cases**
* **No Source**:
  * If no `source` is provided, the effect tracks all reactive dependencies accessed within `fn`, which may lead to unintended dependencies if not carefully managed.
* **Immediate Execution**:
  * When `immediate` is `true`, the effect runs immediately, which may cause unexpected behavior if `fn` has side effects that depend on initialization.

---

## `computed`

The `computed` function creates a lazily-evaluated computed value that re-evaluates only when its dependencies change. This is useful for deriving values from reactive state without re-computing unless necessary.

> #### Syntax
```typescript
function computed<T>(getter: () => T): { readonly value: T };
```

**Parameters**
* `getter`: `() => T`
  * A function that computes the value based on reactive dependencies. The function is called lazily when the `value` property is accessed.

**Returns**
* `{ readonly value: T }`
  * An object with a readonly `value` property that returns the computed value. The value is cached until dependencies change.

**Example:**
```typescript
import { ref, computed } from './reactivity';

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

**Use Cases**
* **Derived State**:
  * Creating derived state, such as computed properties in Vue.js or calculations based on reactive data.
* **Performance Optimization**:
  * Avoiding unnecessary computations by caching the result and only re-computing when dependencies change.
* **Reactive Dependencies**:
  * Building values that depend on multiple reactive sources, such as combining refs and reactive objects.

**Notes**
* **Laziness**:
  * The `getter` function is only called when the `value` property is accessed and the cached value is stale (i.e., dependencies have changed).
* **Caching**:
  * The computed value is cached, improving performance for expensive computations by avoiding redundant work.
* **Dependency Tracking**:
  * The computed value automatically tracks its reactive dependencies, ensuring re-computation only when necessary.

**Edge Cases**
* **Initial Evaluation**:
  * The `getter` is not called until the `value` property is first accessed, which may delay side effects within the `getter`.
* **Non-Reactive Dependencies**:
  * If the `getter` accesses non-reactive data, changes to that data will not trigger re-computation, potentially leading to stale values.

---

### `createMicroStore`

Creates a rective micro store to share between components not necessarly nested.
Accept a `name` string as first argument and a `setup` function which returns a `MicroStore` object.
The `setup` function can get a `selector` function as only argument in case of very complex `state` which will be used inside the `actions` object
which contains the methods to handle the state.
It returns a hook function which returns an object with a `state` prop which is the readonly version of the defined state in the setup function and the methods to handle it.

 #### Syntax
```typescript
function createMicroStore<S extends Record<string, any>,A extends Record<string, (...args: any[]) => any>>(name: string,setup: (select: <T>(fn: Selector<T, S>) => T) => MicroStoreConfig<S, A>): UseMicroStore<S, A>
```

**Example:**
```typescript
import { createMicroStore } from '@pastweb/tools';

const useCounterStore = createMicroStore('counter', select => ({
  state: {
    count: 0,
    name: 'My Counter'
  },
  actions: {
    increment: (by = 1) => {
      const state = select(s => s);          // Get full state
      state.count += by;        // Internal mutation (allowed)
    },
    decrement: (by = 1) => {
      const state = select(s => s);
      state.count -= by;
    },
    setName: (newName: string) => {
      const state = select(s => s);
      state.name = newName;
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


---

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

The `hashID` function attempts to generate a unique identifier (ID) that is not present in a provided cache of existing IDs.
If no cache is provided, it simply returns a randomly generated ID.
This function is useful for ensuring uniqueness in scenarios where IDs must be distinct within a given set.

> #### Syntax
```typescript
function hashID(cache?: string[] | Set<string> | null, config: Config = {}): string;
```

Parameters
* `cache`: `string[] | Set<string> | null` _(optional)_
  * An array or set of existing IDs that the newly generated ID should avoid. If not provided, the function generates a random ID without checking against a cache.
* `config`: `Config` _(optional)_
  * An object containing configuration options for ID generation. The Config type can include:
* `retries`: `number`
  * The number of attempts to make in generating a unique ID that is not in the cache. Defaults to a predefined constant `UNIQUE_RETRIES`.

Returns
* `string`:
  * A unique ID as a string. If a unique ID cannot be generated within the allowed number of retries, the last attempted ID is returned, and an error is logged.

**Example:**
```typescript
import { hashID } from '@pastweb/tools';

const existingIDs = ['id1', 'id2', 'id3'];
const uniqueID = hashID(existingIDs, { retries: 5 });

console.log(uniqueID); // Outputs a unique ID not present in existingIDs
```

Use Cases
* `DOM Element IDs`:
  * Ensuring unique IDs for dynamically generated HTML elements to prevent conflicts in CSS or JavaScript targeting.
* `Database Keys`:
  * Generating unique keys for database records where uniqueness is critical to maintaining data integrity.
* `Resource Management`:
  * Assigning unique identifiers to resources in systems that require distinct labels or identifiers.

Notes
* `Performance Considerations`:
  * The retry mechanism can affect performance if the cache is very large or the number of retries is high. However, the function is optimized by using `Set` for fast lookups.
* `Error Handling`:
  * The function logs an error if it cannot generate a unique ID within the specified retries. This helps in debugging cases where ID collisions are frequent.

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

## Utility functions

### `isSSR`
Checks whether the code is being executed in a server-side rendering (SSR) environment.

**Example:**
```typescript
import { isSSR } from '@pastweb/tools';

if (isSSR) {
  console.log('Running on the server');
} else {
  console.log('Running on the client');
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

### License

This project is licensed under the MIT License.This project is licensed under the MIT License.
