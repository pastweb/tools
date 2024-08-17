export type MediaQueryListener = (this: MediaQueryList, ev: MediaQueryListEvent) => void;

export interface MediaQueryList {
  readonly matches: boolean;
  readonly media: string;
  onchange: MediaQueryListener | null;
  /** @deprecated */
  addListener(listener: MediaQueryListener): void;
  /** @deprecated */
  removeListener(listener: MediaQueryListener): void;
  addEventListener(type: 'change', listener: MediaQueryListener): void;
  removeEventListener(type: 'change', listener: MediaQueryListener): void;
  dispatchEvent(event: Event): boolean;
}
