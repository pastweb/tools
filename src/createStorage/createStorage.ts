import { assign } from '../assign';
import { isObject } from '../isObject';
import { remove as _remove } from '../remove';
import { select } from '../select';
import { noop } from '../noop';
import { Storage, StorageConfig } from './types';

/**
 * Creates a storage utility that supports both IndexedDB and localStorage,
 * with options for custom storage handling, default settings, and hooks for various operations.
 *
 * @param {StorageConfig} config - Configuration options for the storage utility.
 * @returns {Storage} The created storage utility with methods for getting, setting, and removing data.
 *
 * @example
 * const storage = createStorage({
 *   dbName: 'myDatabase',
 *   storeName: 'myStore',
 *   type: 'indexedDB',
 *   defaultSettings: { theme: 'dark' },
 * });
 *
 * // Set a value in storage
 * await storage.set('theme', 'light');
 *
 * // Get a value from storage
 * const theme = await storage.get('theme');
 *
 * // Remove a value from storage
 * await storage.remove('theme');
 */
export function createStorage(config: StorageConfig = {}): Storage {
  const {
    dbName = 'storage',
    storeName = 'storage',
    type = indexedDB ? 'indexedDB' : 'localStorage',
    defaultSettings = {},
    onSet = {},
    onGet = {},
    onRemove = {},
  } = config;

  let db: IDBDatabase;

  const _stored = new Set<string>();
  let _store: Record<string, any> = {};
  let storeReady = false;

  const isStoreReady = new Promise<true>(resolve => {
    let timer = setInterval(() => {
      if (storeReady) {
        clearInterval(timer);
        resolve(true);
      }
    }, 16);
  });

  const _storage: Storage = {
    get: noop,
    set: noop,
    remove: noop,
    isStored: noop,
    isStoreReady,
  };

  (async () => {
    _store = type === 'indexedDB' ? await getDB() : getStorage();
    storeReady = true;
  
    if (!Object.keys(_store).length && defaultSettings) {
      Object.entries(defaultSettings).forEach(async ([key, value]) => {
        if (!_store[key]) {
          await set(key, value, true);
        }
      });
    }
  })();

  /**
   * Checks if a specific path is stored in the storage.
   *
   * @param {string} path - The path to check.
   * @returns {boolean} - True if the path is stored, false otherwise.
   */
  function isStored(path: string): boolean {
    return _stored.has(path);
  }

  /**
   * Retrieves data from IndexedDB.
   *
   * @returns {Promise<Record<string, any>>} - A promise that resolves to the stored data.
   */
  async function getDB(): Promise<Record<string, any>> {
    return await new Promise(async (resolve, reject) => {
      const request = indexedDB.open(dbName, 2);

      request.onsuccess = (event: Event) => {
        db = (event.target as IDBOpenDBRequest).result;
        
        if (db.objectStoreNames.contains(storeName)) {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.get('storage');
          
          request.onsuccess = () => resolve(request.result || {});
          request.onerror = (event: Event) => {
            reject(`Get all objects error in store "${storeName}": ${(event.target as IDBRequest).error}`);
          };
        }
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };

      request.onerror = (event: Event) => {
        reject(`Database error: ${(event.target as IDBOpenDBRequest).error}`);
      };
    });
  }

  /**
   * Retrieves data from localStorage.
   *
   * @returns {Record<string, any>} - The stored data.
   */
  function getStorage(): Record<string, any> {
    const store = JSON.parse(JSON.stringify(localStorage)) as Record<string, any>;

    return Object.entries(store).reduce((acc, [prop, value]) => {
      try {
        value = JSON.parse(value);
      } catch(e) { /* empty */ }

      if (!isObject(value) && !Array.isArray(value) && !isNaN(value)) {
        value = parseFloat(value);
      }

      return { ...acc, [prop]: value };
    }, {});
  }

  /**
   * Retrieves a value from storage.
   *
   * @param {string} path - The path to the value in storage.
   * @returns {Promise<any>} - The stored value.
   */
  async function get(path: string): Promise<any> {
    await isStoreReady;

    let value = select(_store, path);

    if (onGet[path]) {
      value = await onGet[path](_storage, value);
    }

    return value;
  }

  /**
   * Sets a value in storage.
   *
   * @param {string} path - The path to store the value at.
   * @param {any} value - The value to store.
   * @param {boolean} [store=false] - Whether to store the value in the underlying storage (e.g., IndexedDB or localStorage).
   * @returns {Promise<void>}
   */
  async function set(path: string, value: any, store: boolean = false): Promise<void> {
    await isStoreReady;

    let _value = value;

    if (onSet[path]) {
      _value = await onSet[path](_storage, value, store);
    }

    _store = assign(_store, path, _value, true) as Record<string, any>;
    
    if (select(_store, path) !== _value) {
      assign(_store, path, _value);
    }

    if (store || isStored(path)) {
      _stored.add(path);

      if (type === 'indexedDB') {
        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.put(_store, 'storage');
          
          request.onsuccess = () => resolve();
          
          request.onerror = (event: Event) => {
            reject(`Add object error: ${(event.target as IDBRequest).error}`);
          };
        });
      } else {
        const [ key ] = path.split('.');
        localStorage.setItem(key, JSON.stringify(_store[key]));
      }
    }
  }

  /**
   * Removes a value from storage and the underlying storage mechanism.
   *
   * @param {string} path - The path to remove from storage.
   * @returns {Promise<void>}
   */
  async function removeFromStorage(path: string): Promise<void> {
    if (type === 'indexedDB') {
      return await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.get('storage');
        
        request.onsuccess = (event: Event) => {
          const storage = (event.target as IDBRequest).result;
          _remove(storage, path);
          const req = store.put(storage, 'storage');
          
          req.onsuccess = () => resolve();

          req.onerror = (event: Event) => {
            reject(`Remove object error: ${(event.target as IDBRequest).error}`);
          };
        };
        
        request.onerror = (event: Event) => {
          reject(`Remove object error: ${(event.target as IDBRequest).error}`);
        };
      });
    } else {
      const [ key, ...rest ] = path.split('.');
      
      if (!rest.length) {
        localStorage.removeItem(key);
      } else {
        let stored = JSON.parse(localStorage.getItem(key) as string);
        stored = _remove(stored, path, true) as Record<string, any>;
        localStorage.setItem(key, JSON.stringify(stored));
      }
    }

    _stored.delete(path);
  }

  /**
   * Removes a value from storage.
   *
   * @param {string} path - The path to remove.
   * @param {boolean} [justLocalStorage=false] - Whether to only remove the value from local storage.
   * @returns {Promise<void>}
   */
  async function remove(path: string, justLocalStorage: boolean = false): Promise<void> {
    await isStoreReady;

    if (onRemove[path]) {
      await onRemove[path](_storage, path, justLocalStorage);
    }

    if (!justLocalStorage) {
      _store = _remove(_store, path, true) as Record<string, any>;
    }

    await removeFromStorage(path);
  }

  _storage.get = get;
  _storage.set = set;
  _storage.remove = remove;
  _storage.isStored = isStored;

  return Object.freeze(_storage);
}
