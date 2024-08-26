import i18n, {
  TFunction,
  Callback,
  InitOptions,
  PostProcessorModule,
  LanguageDetectorAsyncModule,
  LanguageDetectorModule,
  BackendModule,
  ThirdPartyModule,
} from 'i18next';
import { AsyncStore, AsyncStoreOptions } from '../createAsyncStore';

export type LazyTranslations = () => Promise<Translations>;

export type Translations = {
  [key: string]: string | Translations | LazyTranslations;
};

export interface StaticTranslations {
  [key: string]: string | StaticTranslations;
}

export type onInit = ((lang: string) => string) | ((lang: string) => Promise<string>);

export interface LangOptions {
  initLang?: string | onInit;
  i18n?: InitOptions;
  onLangChange?: (lang: string) => void | Promise<void>;
  supported: string[] | (() => Promise<string[]>);
  translations: Translations | ((lang: string) => Promise<Translations>);
  use?: PostProcessorModule |
        LanguageDetectorAsyncModule |
        LanguageDetectorModule |
        BackendModule |
        ThirdPartyModule |
        (PostProcessorModule |
          LanguageDetectorAsyncModule |
          LanguageDetectorModule |
          BackendModule |
          ThirdPartyModule)[];
};

export interface LangAsyncStore extends AsyncStore<AsyncStoreOptions & LangOptions> {
  i18n: typeof i18n;
  current: Promise<string>;
  supported: string[] | Promise<string[]>;
  t: TFunction;
  changeLanguage: (lng: string | undefined, callback?: Callback) => Promise<TFunction<'translation', undefined>>;
};
