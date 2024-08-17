import { noop } from '../../noop';
import { LanguageDetectorAsyncModule } from 'i18next';
import { onInit } from '../types';

export function getLang(supportedLangs: string[]): string {
  const langs = new Set(supportedLangs);
  const code = window.navigator.language || (window.navigator as any).browserLanguage as string;

  let lang = code;

  if (!langs.has(lang)) {
    const [ shortLang ] = lang.split('-');

    if (!langs.has(shortLang)) {
      throw Error(`Languages error - "${code}" or "${shortLang}" not supported.`);
    }

    console.warn(`Lang: "${lang}" not supported, fallback to "${shortLang}".`);
    lang = shortLang;
  }

  return lang;
}

export function languageDetector(
  supportedLangs: string[] | Promise<string[]>,
  callback: (lng: string) => void | undefined = noop,
  initLang?: string | onInit,
  ): LanguageDetectorAsyncModule {
  return {
    type: 'languageDetector',
    async: true, // If this is set to true, your detect function receives a callback function that you should call with your language, useful to retrieve your language stored in AsyncStorage for example
    init(services, detectorOptions, i18nextOptions) { // optional since v22.3.0
      /* use services and options */
    },
    detect(cb) { // You'll receive a callback if you passed async true
      (async () => {
        let lang = getLang(Array.isArray(supportedLangs) ? supportedLangs : await supportedLangs);

        switch(typeof initLang) {
          case 'string':
            lang = initLang as string;
          break;
          case 'function':
            lang = await (initLang as onInit)(lang);
          break;
        }
        
        /* return detected language */
        cb(lang); // if you used the async flag
        callback(lang);
      })()
    },
    // or new since v22.3.0
    // detect: async function () { // you can also return a normal Promise
    //   /* return detected language */
    //   return 'de';
    //   // or
    //   // return Promise.resolve('de')
    // },
    cacheUserLanguage: function(lng) { // optional since v22.3.0
      /* cache language */
    }
    // or new since v22.3.0, but i18next will not await for it... so it's basically a fire and forget
    // cacheUserLanguage: async function(lng) {
    //   /* await cache language */
    // }
  }
}
