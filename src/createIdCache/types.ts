export interface IdCache {
  getId: (scopeName: string, prefix?: string) => string;
  removeId: (scopeName: string, id: string) => void;
  has: (scopeName: string, id: string) => boolean;
};
