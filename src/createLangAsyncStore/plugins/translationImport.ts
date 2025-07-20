import { BackendModule } from 'i18next';
import { traversLazyTranslations } from './util';
import type { LangOptions, LazyTranslations } from '../types';

export function translationImport(translations: LangOptions['translations']): BackendModule {
  return {
    type: 'backend',
    init(services, backendOptions, i18nextOptions) {
    },
    read(language, namespace, callback) {
      (async () => {
        let translation = {};
        
        if (typeof translations === 'function') {
          translation = await translations(language);
        } else if (typeof translations[language] === 'function') {
          const { default: _translation } = await (translations[language] as LazyTranslations)();
          translation = _translation;
        } else {
          translation = translations[language];
        }

        translation = await traversLazyTranslations(translation);

        callback(null, translation);
      })();
    },
    save(language, namespace, data) {
    },
    create(languages, namespace, key, fallbackValue) {
      /* save the missing translation */
    },
  };
}
