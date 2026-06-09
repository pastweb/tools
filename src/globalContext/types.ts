export type GlobalContext = Record<string | symbol, any>;

export type Props = any & object;

export interface ContextUtils {
  getContext: <T>(key: string | symbol) => T | undefined;
  setContext: <T>(key: string | symbol, value: T) => void;
};

export type Mediator<State extends {} = {}> = { state?: State; } & object;

export type MediatorFunction<T = any> = (props: Props) => any & T;

export type MediatorContextFunction<T = any> = (props: Props, ctxUtils: ContextUtils) => any & T;
