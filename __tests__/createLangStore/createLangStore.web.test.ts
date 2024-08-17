import { createLangStore } from '../../src/createLangStore';
import { LangOptions, LangStore } from '../../src/createLangStore/types';

describe('createLangStore', () => {
  let options: LangOptions;
  let store: LangStore;

  beforeEach(() => {
    options = {
      initLang: 'en',
      supported: ['en', 'fr'],
      translations: { en: { translation: { key: 'value' } } },
      i18n: { fallbackLng: 'en' },
      use: [],
    };
    store = createLangStore(options);
  });

  it('should create a LangStore with the provided options', async () => {
    await store.isReady;

    expect(store.options.storeName).toBe('LangStore');
    expect(store.options.initLang).toBe(options.initLang);
    expect(Array.isArray(store.options.supported)).toBe(true);
    expect((store.options.supported as string[])[0]).toBe((options.supported as string[])[0]);
    expect((store.options.supported as string[])[1]).toBe((options.supported as string[])[1]);
    expect(store.options.translations).toBeDefined();
    expect((store.options.translations as any).en).toBeDefined();
    expect((store.options.translations as any).en.translation).toBeDefined();
    expect((store.options.translations as any).en.translation.key).toBe((options.translations as any).en.translation.key);
    expect(store.options.i18n).toBeDefined();
    expect(Array.isArray(store.options.i18n?.fallbackLng)).toBe(true);
    expect((store.options.i18n?.fallbackLng as string[])[0]).toBe('en');
    expect(Array.isArray(store.options.use)).toBe(true);
    expect((store.options.use as Array<any>).length).toBe(0);
    expect(store.i18n).toBeDefined();

    const initSpy = jest.spyOn(store, 'init');

    expect(initSpy).toHaveBeenCalledTimes(0);
  });
});
