import { describe, it, expect, beforeEach } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { createStorage } from '../../src/createStorage';

describe('given the createStorage factory', () => {
  beforeEach(() => {
    localStorage.clear();
    indexedDB = new IDBFactory();
  });

  it('given localStorage type and defaultSettings strings, when create and await ready, then localStorage has the parsed default values', async () => {
    const defaultSettings = {
      first: 'this is the first value',
      second: 'this is the second value',
    };

    const storage = createStorage({
      type: 'localStorage',
      defaultSettings,
    });

    await storage.isStoreReady;
    const store = JSON.parse(JSON.stringify(localStorage))  as Record<string, any>;
    
    expect(JSON.parse(store.first)).toBe(defaultSettings.first);
    expect(JSON.parse(store.second)).toBe(defaultSettings.second);
  });

  it('given localStorage with number defaults, when create/ready/get, then values match and storage has parsed numbers', async () => {
    const defaultSettings = {
      first: 1,
      second: 2,
    };

    const storage = createStorage({
      type: 'localStorage',
      defaultSettings
    });
    
    await storage.isStoreReady;
    const store = JSON.parse(JSON.stringify(localStorage))  as Record<string, any>;

    const first = await storage.get('first');
    const second = await storage.get('second');

    expect(JSON.parse(store.first)).toBe(defaultSettings.first);
    expect(JSON.parse(store.second)).toBe(defaultSettings.second);
    expect(first).toBe(defaultSettings.first);
    expect(second).toBe(defaultSettings.second);
  });

  it('given localStorage with onGet for first that returns value+1, when get first/second, then first is +1 but storage not mutated for first, second unchanged', async () => {
    const defaultSettings = {
      first: 1,
      second: 2,
    };

    const storage = createStorage({
      type: 'localStorage',
      defaultSettings,
      onGet: {
        first: async (s, value) => value + 1,
      },
    });
    
    await storage.isStoreReady;

    const first = await storage.get('first');
    const second = await storage.get('second');
    
    const store = JSON.parse(JSON.stringify(localStorage))  as Record<string, any>;

    expect(JSON.parse(store.first)).toBe(defaultSettings.first);
    expect(JSON.parse(store.second)).toBe(defaultSettings.second);
    expect(first).toBe(defaultSettings.first + 1);
    expect(second).toBe(defaultSettings.second);
  });

  it('given a stored value for key "first", when onGet hook is provided and get is called, then the hook can modify/return a transformed value', async () => {
    const defaultSettings = {
      first: 1,
      second: 2,
    };

    const storage = createStorage({
      type: 'localStorage',
      defaultSettings,
      onGet: {
        first: async (s, value) => {
          await s.set('first', value + 1, true);
          return value + 1;
        },
      },
    });
    
    await storage.isStoreReady;

    const first = await storage.get('first');
    const second = await storage.get('second');
    
    const store = JSON.parse(JSON.stringify(localStorage))  as Record<string, any>;

    expect(JSON.parse(store.first)).toBe(defaultSettings.first + 1);
    expect(JSON.parse(store.second)).toBe(defaultSettings.second);
    expect(first).toBe(defaultSettings.first + 1);
    expect(second).toBe(defaultSettings.second);
  });

  it('given localStorage with onRemove for second that sets first to second value, when remove second, then storage first updated, second gone, get first returns the onRemove value', async () => {
    const defaultSettings = {
      first: 1,
      second: 2,
    };

    const storage = createStorage({
      type: 'localStorage',
      defaultSettings,
      onRemove:{
        second: async (s) => {
          await s.set('first', defaultSettings.second, true);
        },
      },
    });
    
    await storage.isStoreReady;
    await storage.remove('second');
    const first = await storage.get('first');
    
    const store = JSON.parse(JSON.stringify(localStorage))  as Record<string, any>;

    expect(JSON.parse(store.first)).toBe(defaultSettings.first + 1);
    expect(store.second).toBeUndefined();
    expect(first).toBe(defaultSettings.second);
  });

  it('given indexedDB default (no type), when create/ready, then db "storage" exists with object store and defaults stored', async () => {
    const defaultSettings = {
      first: 'this is the first value',
      second: 'this is the second value',
    };

    const storage = createStorage({ defaultSettings });

    await storage.isStoreReady;

    let hasDB = false;
    let hasStoreObject = false;

    const store = await new Promise<Record<string, any>>(async (resolve, reject) => {
      const request = indexedDB.open('storage', 2);

      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        hasDB = true;

        if (db.objectStoreNames.contains('storage')) {
          hasStoreObject = true;
          const transaction = db.transaction('storage', 'readwrite');
          const store = transaction.objectStore('storage');
          const request = store.get('storage');
          
          request.onsuccess = () => resolve(request.result);
          request.onerror = (event: Event) => {
            reject(`Get all objects error in store "storage": ${(event.target as IDBRequest).error}`);
          };
        }
      };
    });
    
    expect(hasDB).toBe(true);
    expect(hasStoreObject).toBe(true);
    expect(store.first).toBe(defaultSettings.first);
    expect(store.second).toBe(defaultSettings.second);
  });

  it('given indexedDB with number defaults, when create/ready/get, then stored and get return the numbers', async () => {
    const defaultSettings = {
      first: 1,
      second: 2,
    };

    const storage = createStorage({ defaultSettings });
    
    await storage.isStoreReady;
    const store = await new Promise<Record<string, any>>(async (resolve, reject) => {
      const request = indexedDB.open('storage', 2);

      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (db.objectStoreNames.contains('storage')) {
          const transaction = db.transaction('storage', 'readwrite');
          const store = transaction.objectStore('storage');
          const request = store.get('storage');
          
          request.onsuccess = () => resolve(request.result);
          request.onerror = (event: Event) => {
            reject(`Get all objects error in store "storage": ${(event.target as IDBRequest).error}`);
          };
        }
      };
    });

    const first = await storage.get('first');
    const second = await storage.get('second');

    expect(store.first).toBe(defaultSettings.first);
    expect(store.second).toBe(defaultSettings.second);
    expect(first).toBe(defaultSettings.first);
    expect(second).toBe(defaultSettings.second);
  });

  it('given indexedDB with onGet +1 no mutate for first, when get, then db not changed for first, returned +1, second ok', async () => {
    const defaultSettings = {
      first: 1,
      second: 2,
    };

    const storage = createStorage({
      defaultSettings,
      onGet: {
        first: async (s, value) => value + 1,
      },
    });
    
    await storage.isStoreReady;

    const first = await storage.get('first');
    const second = await storage.get('second');
    
    const store = await new Promise<Record<string, any>>(async (resolve, reject) => {
      const request = indexedDB.open('storage', 2);

      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (db.objectStoreNames.contains('storage')) {
          const transaction = db.transaction('storage', 'readwrite');
          const store = transaction.objectStore('storage');
          const request = store.get('storage');
          
          request.onsuccess = () => resolve(request.result);
          request.onerror = (event: Event) => {
            reject(`Get all objects error in store "storage": ${(event.target as IDBRequest).error}`);
          };
        }
      };
    });

    expect(store.first).toBe(defaultSettings.first);
    expect(store.second).toBe(defaultSettings.second);
    expect(first).toBe(defaultSettings.first + 1);
    expect(second).toBe(defaultSettings.second);
  });

  it('given indexedDB with onGet that sets+returns +1 for first, when get first/second, then db store and returns are +1 for first', async () => {
    const defaultSettings = {
      first: 1,
      second: 2,
    };

    const storage = createStorage({
      defaultSettings,
      onGet: {
        first: async (s, value) => {
          await s.set('first', value + 1, true);
          return value + 1;
        },
      },
    });
    
    await storage.isStoreReady;

    const first = await storage.get('first');
    const second = await storage.get('second');
    
    const store = await new Promise<Record<string, any>>(async (resolve, reject) => {
      const request = indexedDB.open('storage', 2);

      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (db.objectStoreNames.contains('storage')) {
          const transaction = db.transaction('storage', 'readwrite');
          const store = transaction.objectStore('storage');
          const request = store.get('storage');
          
          request.onsuccess = () => resolve(request.result);
          request.onerror = (event: Event) => {
            reject(`Get all objects error in store "storage": ${(event.target as IDBRequest).error}`);
          };
        }
      };
    });

    expect(store.first).toBe(defaultSettings.first + 1);
    expect(store.second).toBe(defaultSettings.second);
    expect(first).toBe(defaultSettings.first + 1);
    expect(second).toBe(defaultSettings.second);
  });

  it('given indexedDB with onRemove second that sets first, when remove second, then db first updated, second undefined, get first is the set value', async () => {
    const defaultSettings = {
      first: 1,
      second: 2,
    };

    const storage = createStorage({
      defaultSettings,
      onRemove:{
        second: async (s) => {
          await s.set('first', defaultSettings.second, true);
        },
      },
    });
    
    await storage.isStoreReady;
    await storage.remove('second');
    const first = await storage.get('first');
    
    const store = await new Promise<Record<string, any>>(async (resolve, reject) => {
      const request = indexedDB.open('storage', 2);

      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (db.objectStoreNames.contains('storage')) {
          const transaction = db.transaction('storage', 'readwrite');
          const store = transaction.objectStore('storage');
          const request = store.get('storage');
          
          request.onsuccess = () => resolve(request.result);
          request.onerror = (event: Event) => {
            reject(`Get all objects error in store "storage": ${(event.target as IDBRequest).error}`);
          };
        }
      };
    });

    expect(store.first).toBe(defaultSettings.first + 1);
    expect(store.second).toBeUndefined();
    expect(first).toBe(defaultSettings.second);
  });
});
