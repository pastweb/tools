import { isObject } from '../../isObject';
import type { Translations, LazyTranslations, StaticTranslations } from '../types';

export async function traversLazyTranslations(translations: Translations): Promise<StaticTranslations> {
  const staticTranslations: StaticTranslations = {};

  for (const [key, translation] of Object.entries(translations)) {
    if (isObject(translation)) staticTranslations[key] = await traversLazyTranslations(translation as Translations);
    else if (typeof translation === 'function') {
      const { default: _translation } = await (translation as LazyTranslations)(); 
      staticTranslations[key] = await traversLazyTranslations(_translation as Translations);
    } else {
      staticTranslations[key] = translation as string;
    }
  }

  return staticTranslations;
}
