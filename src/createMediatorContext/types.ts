export type Props = any & object;
export type Extras = any & object;

export interface Context {
  getContext: <T>(key: string) => T | undefined;
  setContext: <T>(key: string, value: T) => void;
};

export type MediatorFunction<T = any> = (props?: Props, extras?: Extras, context?: Context) => any & T;
