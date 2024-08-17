# tools

Contains a collection of utility functions to help with various common tasks in JavaScript and TypeScript application development.
Below you will find descriptions of each function along with examples of how to use them.

## Summary

- [Async functions](#async-functions)
  - [createApiAgent](#createapiagent)
  - [createAsyncStore](#createasyncstore)
    - [normalizeAsyncQueue](#normalizeasyncqueue)
  - [createEventEmitter](#createeventemitter)
  - [createLangStore](#createlangstore)
  - [debounce](#debounce)
  - [throttle](#throttle)
- [Browser functions](#browser-functions)
  - [createMatchDevice](#creatematchdevice)
  - [createStorage](#createStorage)
  - [createViewRouter](#createviewrouter)
    -[routeDive](#routedive)
- [Date and Time](#date-and-time)
  - [isDateYoungerOf](#isdateyoungerof)
  - [isHoursTimeYoungerThen](#ishourstimeyoungerthen) _(Deprecated)_
- [Element functions](#element-functions)
  - [cl](#cl)
  - [createEntry](#createEntry)
  - [createPortal](#createportal)
    - [anchorsSetup](#anchorssetup)
    - [generateAnchors](#generateanchors)
  - [getFullElementSize](#getfullelementsize)
- [Object functions](#object-functions)
  - [assign](#assign)
  - [createState](#createstate)
  - [deepMerge](#deepmerge)
  - [getType](#gettype)
  - [effect](#effect)
  - [isObject](#isobject)
  - [isType](#istype)
  - [proxy](#proxy)
  - [remove](#remove)
  - [select](#select)
  - [update](#update)
  - [withDefaults](#withdefaults)
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

---
## Async functions

### `createApiAgent`

Creates an API agent with customizable settings for HTTP requests.

> #### Syntax
```typescript
function createApiAgent(settings?: AgentSettings): Agent;
```
Parameters
* `settings`: `AgentSettings` (optional) The settings for the API agent.
  * `withCredentials`: `boolean` (optional, default: false)
    * Indicates whether cross-site Access-Control requests should be made using credentials.
  * `headers`: `Record<string, any>` (optional, default: {})
    * Custom headers to be sent with each request.
  * `exclude`: `string | RegExp | Array<string | RegExp>` _(optional)_
    * URLs or patterns to exclude from request intercepting.
  * `onGetValidToken`: `() => Promise<Record<string, any>>` _(optional)_
    * Function to get a valid token for authorization.
  * `onUnauthorizedResponse`: `() => void` _(optional)_
    * Callback for unauthorized responses.

Returns
* `Agent`
  * The configured API agent.

Methods
* `setAgentConfig(settings: AgentSettings): void`
  * Sets the agent configuration.
* `mergeAgentConfig(newSettings: AxiosRequestConfig): void`
  * Merges new settings into the existing agent configuration.
* `delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>`
  * Sends a DELETE request.
* `get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>`
  * Sends a GET request.
* `patch(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse>`
  * Sends a PATCH request.
* `post(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse>`
  * Sends a POST request.
* `put(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse>`
  * Sends a PUT request.
* `upload(url: string, data: FormData, onUploadProgress?: (e: AxiosProgressEvent) => void): Promise<AxiosResponse>`
  * Uploads a file using a POST request.
* `download(url: string, fileName: string, domElement?: HTMLElement): Promise<AxiosResponse>`
  * Downloads a file using a GET request and triggers a download in the browser.

**Example:**
```typescript
import { createApiAgent } from '@pastweb/tools';

const apiAgent = createApiAgent({
  withCredentials: true,
  headers: { 'Authorization': 'Bearer token' },
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
```
---
### `createAsyncStore`

Creates an asynchronous store with the given options.

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
### `createLangStore`

Creates a language asynchronous store with `i18next` integration for managing translations.
The createLangStore function provides a flexible way to manage multiple languages in your application using `i18next`. It supports:

* Initialization with an initial language.
* Dynamic support for multiple languages.
* Integration with translation resources.
* Custom plugins for `i18next`.
The store is asynchronous and ensures that the language settings and resources are ready before allowing operations like language switching. It is designed to work seamlessly with both synchronous and asynchronous workflows.

> #### Syntax
```typescript
function createLangStore(options: LangOptions): LangStore;
```
Parameters
* `options`: `LangOptions`
  * Configuration options for the language store. This includes initial language settings, supported languages, translation resources, and additional `i18next` options.

Returns
* `LangStore`
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
```typescript
import { createLangStore } from '@pastweb/tools';

const langStore = createLangStore({
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

* `onMatch(isDeviceName: string, fn: (result: boolean, isDeviceName: string) => void): void`
  * Sets a listener for a specific device match event. The callback is triggered whenever the specified device's match state changes.
  * `isDeviceName`: `string`
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

matchDevice.onMatch('mobile', (isMobile) => {
  console.log('Mobile device match changed:', isMobile);
});

const currentDevices = matchDevice.getDevices();
console.log('Current matched devices:', currentDevices);
```
---
### `createStorage`

Creates a versatile storage utility that supports both IndexedDB and localStorage. This utility allows for custom storage handling, default settings, and hooks for various operations.

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
  * `href`: `string` _(optional)_
    * The current URL as a string.
  * `RouterView`: `Component` _(mandatory)_
    * The component to render for matched routes.
  * `beforeRouteParse`: `(route: Route) => Route` _(optional)_
    * A function to execute before parsing a route.
  * `beforeRouteSelect`: `(route: SelectedRoute) => SelectedRoute` _(optional)_
    * A function to execute before selecting a route.
  * `sensitive`: boolean _(optional)_
    * If true, route matching will be case-sensitive.

Returns
* `ViewRouter`
  * An object that represents the router. This object contains properties and methods to manage routing within the application.

**Example:**
```typescript
import { createViewRouter } from '@pastweb/tools';

const router = createViewRouter({
  routes: [
    { path: '/', component: HomePage },
    { path: '/about', component: AboutPage },
  ],
  preloader: () => console.log('Loading...'),
  RouterView: MyRouterViewComponent,
});
```

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

Methods
* `setBase(base: string): void`
  * Sets the base path for the router. The base path is the common prefix for all routes.
* `addRoute(route: Route): void`
  * Adds a new route to the router dynamically after the router has been initialized.
* `onRouteChange(fn: (route: SelectedRoute) => void): RemoveListener`
  * Subscribes to route change events. The provided callback function will be called whenever the route changes.
* `onRouteAdded(fn: (routes: Route[]) => void): RemoveListener`
  * Subscribes to route added events. The provided callback function will be called whenever a new route is added to the router.
* `navigate(path: string, state?: any): void`
  * Navigates to a specific path programmatically.
* `push(path: string, state?: any): void`
  * Pushes a new state onto the history stack and navigates to the specified path.
* `replace(path: string, state?: any): void`
  * Replaces the current state in the history stack with a new state and navigates to the specified path.
* `go(delta: number): void`
  * Moves forward or backward in the history stack by a specified number of steps.
* `setSearchParams(searchParams: URLSearchParams): void`
  * Sets the search parameters for the current location without reloading the page.
* `setHash(hash?: string): void`
  * Sets the hash for the current location without reloading the page.
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
import { routeDive } from './path/to/routeDive';
import { SelectedRoute } from '../types';

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

### `isHoursTimeYoungerThen`
> **⚠️ Deprecated:** This function is deprecated and will be removed in future versions. Please use the `isDateYoungerOf` function instead.

The `isHoursTimeYoungerThen` function checks if the difference between the current time and a given timestamp is less than a specified number of hours.

> #### Syntax
```typescript
function isHoursTimeYoungerThen(hoursTime: number, then: number): boolean;
```

Parameters
* `hoursTime`: `number`
  * A timestamp in milliseconds (since the Unix epoch) representing the time to compare against the current time.
* `then`: `number`
  * The threshold number of hours to compare against. If the difference between the current time and `hoursTime` is less than this value, the function returns `true`.

Returns
* `boolean`:
  * Returns `true` if the time difference is less than the specified number of hours (`then`); otherwise, returns `false`.

**Example:**
```typescript
import { isHoursTimeYoungerThen } from '@pastweb/tools';

const hoursTime = new Date().getTime() - (2 * 60 * 60 * 1000); // 2 hours ago
console.log(isHoursTimeYoungerThen(hoursTime, 3)); // Output: true
```

Notes
* `Deprecation Notice`: This function is deprecated and will be removed in future versions. It is recommended to use the `isDateYoungerOf` function instead for more flexibility and comprehensive date comparison.
* `Precision`: The function calculates the difference down to the hour level. If more precision is required (e.g., minutes or seconds), consider using a different approach or function.

Limitations
* `Limited Granularity`: The function only compares the difference at the hour level. It does not take minutes or seconds into account beyond converting them to hours.
* `Handling of Edge Cases`: The function assumes that the `hoursTime` is a valid timestamp and that then is a non-negative number. Unexpected behavior may occur if invalid inputs are provided.

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
cl.setClasses(
  classes: CSSModuleClasses | CSSModuleClasses[], 
  mode: 'merge' | 'replace' = 'merge'
): (...args: ClassValue[]) => string;
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

**Example:**
```typescript
import { cl } from '@pastweb/tools';

const cssModules = {
  'btn': 'btn_hash',
  'btn-primary': 'btn-primary_hash',
};

const mergeClasses = cl.setClasses(cssModules, 'merge');
const classNames = mergeClasses('btn', 'btn-primary');
// Output: 'btn_hash btn-primary_hash'

const replaceClasses = cl.setClasses(cssModules, 'replace');
const replacedClassNames = replaceClasses('btn', 'btn-primary');
// Output: 'btn-primary_hash'
```
---
### `createEntry`

Creates an entry object with event emitter capabilities and various utility methods to be extended for a specific frontend framework.

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
### `createState`

Creates a simple state management utility that allows you to manage and update state in a controlled manner.
This function is generic and can be used to manage any kind of state object.

> #### Syntax
```typescript
function createState<State>(
  initialState: State | InitiaStateFunction<State> = {} as State,
  onStateChange?: (state: State) => void
): {
  state: State;
  setState: (state: Partial<State>) => void;
}
```

Parameters
* `initialState`: `State | InitiaStateFunction<State>` _(optional)_
  * The initial state of the utility. This can either be a state object or a function that returns the initial state. If not provided, an empty object of type State is used as the default.
* `onStateChange`: `(state: State) => void` _(optional)_
  * A callback function that is triggered whenever the state changes. This function receives the updated state as its argument. By default, this parameter is a no-op function (does nothing).

Returns
* `Object`: An object containing two properties:
  * `state`: `State`
    * The current state object. This state is initialized with the initialState and updated when setState is called.
  * `setState`: `(state: Partial<State>) => void`
    * A function to update the state. This function accepts a partial state object and merges it with the existing state. After the state is updated, the onStateChange callback is invoked.

**Example:**
```typescript
import { createState } from 'pastweb/tools';

type MyState = {
  count: number;
  user: { name: string; age: number };
};

const initialState: MyState = { count: 0, user: { name: 'Alice', age: 25 } };

const { state, setState } = createState(initialState, (newState) => {
  console.log('State changed:', newState);
});

console.log(state.count); // 0

setState({ count: state.count + 1 });
console.log(state.count); // 1

setState({ user: { name: 'Bob', age: 30 } });
console.log(state.user.name); // Bob
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
### `effect`

The `effect` function creates a reactive effect on specified properties of a target object.
Whenever one of these properties changes, a provided callback function is executed, receiving details about the change.
This mechanism supports performance optimization by batching and debouncing changes.

> #### Syntax
```typescript
function effect<T extends object = {}>(
  target: T,
  callback: EffectCallback<T>,
  ...filter: (Extract<keyof T, string> | number | symbol)[]
): void;
```

Parameters
* `target`: `T`
  * The target object to observe. The function will monitor changes to specified properties of this object.
* `callback`: `EffectCallback<T>`
  * The callback function to execute when a specified property changes. It receives an object containing the newValues, oldValues, and the properties (prop) that changed.
* `...filter`: `(Extract<keyof T, string> | number | symbol)[]`
  * An optional list of property names, symbols, or numbers to observe. If not provided, all properties of the target object will be observed.

Returns
* `void`:
  * This function doesn't return any value. It modifies the target object to reactively respond to changes.

**Example:**
```typescript
import { effect } from '@pastweb/tools';

const obj = { a: 1, b: 2 };

effect(obj, ({ newValues, oldValues }) => {
  console.log(`Changes detected:`, newValues, oldValues);
}, 'a');

obj.a = 3; // Logs: Changes detected: { a: 3 } { a: 1 }
```

Description
The effect function monitors changes to specific properties of a target object. When a change occurs, it triggers a callback function that receives information about the updated values. The changes are debounced to improve performance, ensuring that rapid updates are grouped together before the callback is executed.

This function is useful for creating reactive systems where changes to an object's state should trigger specific actions or updates.

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
import { getType } from './path/to/your/module';

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
import { isType } from './path/to/your/module';

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
import { kebabize } from './path/to/your/module';

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
import { memo } from './path/to/your/module';

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
import { noop } from './path/to/your/module';

function exampleFunction(callback = noop) {
  // Some operation
  callback();
}

exampleFunction(); // No operation is performed by the callback
exampleFunction(() => console.log('Callback called')); // Logs 'Callback called'
```
---

## Styles

here the styles documentation

### License

This project is licensed under the MIT License.This project is licensed under the MIT License.
