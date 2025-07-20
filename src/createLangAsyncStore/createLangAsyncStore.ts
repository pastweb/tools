import { createAsyncStore } from '../createAsyncStore';
import i18n, { Callback, TFunction } from 'i18next';
import { languageDetector, translationImport } from './plugins';
import { noop } from '../noop';
import type { LangAsyncStore, LangOptions } from './types';

/**
 * Creates a language async store with i18next integration for managing translations.
 *
 * @param {LangOptions} options - Configuration options for the language store.
 * @returns {LangStore} The created language store.
 *
 * @example
 * const langStore = createLangStore({
 *   initLang: 'en',
 *   supported: ['en', 'fr', 'es'],
 *   translations: { en: { translation: { key: 'value' } } },
 *   i18n: { fallbackLng: 'en' },
 * });
 * langStore.changeLanguage('fr');
 */
export function createLangAsyncStore(options: LangOptions): LangAsyncStore {
  const store = createAsyncStore<LangAsyncStore>({ ...options, storeName: 'LangStore' });

  store.i18n = i18n.createInstance();
  store.init = noop;

  const {
    initLang,
    i18n: initOptions = {},
    supported,
    translations,
    use = [],
  } = store.options;

  let _supported: string[];
  
  store.supported = Array.isArray(supported) ? supported :
    new Promise(async (resolve) => {
      if (_supported) {
        resolve(_supported);
        return;
      }
      
      _supported = await supported();
      resolve(_supported);
      return;
    });

  let currentLanguage: string = '';
  
  const _use = [
    ...!initOptions.lng ? [
      languageDetector(store.supported, (lang) => {
        currentLanguage = lang;
      }, initLang)
    ] : [],
    ...!initOptions.resources ? [translationImport(translations)]: [],
    ...Array.isArray(use) ? use : [ use ],
  ];

  _use.forEach(plugin => store.i18n.use(plugin));

  store.i18n.init(initOptions)
    .then(() => { store.setStoreReady(); })
    .catch((err) => { console.log(err); });

  store.current = new Promise((resolve) => {
    if (initOptions.lng) {
      resolve(initOptions.lng);
      return;
    }

    const interval = setInterval(() => {
      if (currentLanguage) {
        clearInterval(interval);
        resolve(currentLanguage);
        return;
      }
    }, 16);
  });
  
  store.t = store.i18n.t;

  store.changeLanguage = (lng: string | undefined, callback: Callback = noop): Promise<TFunction<'translation', undefined>>  => {
    return store.i18n.changeLanguage(lng, async (error, t) => {
      if (error) {
        console.log(error);
      } else {
        const { onLangChange = noop } = store.options;
        await onLangChange(lng);
        callback(error, t);
      }
    });
  };

  return store;
}
