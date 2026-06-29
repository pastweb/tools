export type Ref<T> = { value: T };
export type Reactive<T> = T;
export type Computed<T> = T extends object ? Readonly<T> : { readonly value: T };
