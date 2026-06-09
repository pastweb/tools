export type GlobalContext = Record<string, any>;

export type Props = any & object;

export interface ContextUtils {
  getContext: <T>(key: string) => T | undefined;
  setContext: <T>(key: string, value: T) => void;
};

export type Mediator<State extends {} = {}> = { state?: State; } & object;

export type MediatorFunction<T = any> = (props: Props) => any & T;

export type MediatorContextFunction<T = any> = (props: Props, ctxUtils: ContextUtils) => any & T;
