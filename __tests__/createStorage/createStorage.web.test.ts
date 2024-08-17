import { IDBFactory } from 'fake-indexeddb';
import { createStorage } from '../../src/createStorage';

describe('createStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    indexedDB = new IDBFactory();
  });

  it('should create a localStorage with defaultSettings', async () => {
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

  it('should create a localStorage with number defaultSettings', async () => {
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

  it('should return "first + 1" whiuot modify the storage', async () => {
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

  it('should modify the value of "first" onGet the value', async () => {
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

  it('should modify the value of "first" in localStorage onRemove "second"', async () => {
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

  it('should create a indexedDB with defaultSettings', async () => {
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

  it('should create a db with number defaultSettings', async () => {
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

  it('should return "first + 1" whiuot modify the db storage', async () => {
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

  it('should modify the value of "first" onGet the value', async () => {
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

  it('should modify the value of "first" in indexedDB onRemove "second"', async () => {
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
