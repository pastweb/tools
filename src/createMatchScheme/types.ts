import { AsyncStore, AsyncStoreOptions } from '../createAsyncStore';
import { RemoveListener } from '../createEventEmitter';

export interface ColorSchemeInfo {
  mode: string;
  system: string;
  selected: string;
};

export interface MatchScheme {
  getInfo: () => ColorSchemeInfo;
  setMode: (mode: string) => void;
  onModeChange: (fn: (mode: string) => void) => RemoveListener;
  onSysSchemeChange: (fn: (schema: string) => void) => RemoveListener;
};

export interface SchemeOptions {
  defaultMode?: string;
  datasetName?: string | true;
};

export interface SchemeOptionsAsyncStore extends SchemeOptions {
  initStore?: (matchScheme: MatchScheme) => Promise<void>;
}

export interface ColorSchemeAsyncStore extends AsyncStore<AsyncStoreOptions & SchemeOptions> {
  matchScheme: MatchScheme;
};