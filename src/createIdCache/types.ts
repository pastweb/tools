export interface IdCache {
  getId: (scopeName: symbol, prefix?: string) => string;
  removeId: (scopeName: symbol, id: string) => void;
  has: (scopeName: symbol, id: string) => boolean;
};
