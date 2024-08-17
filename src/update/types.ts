export type UpdateOptions<T> = {
  shallow?: boolean;
  exclude?: Extract<keyof T, string> | (Extract<keyof T, string>)[];
};
