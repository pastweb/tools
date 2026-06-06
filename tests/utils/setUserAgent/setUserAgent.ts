let storedUserAgent: string;

if (typeof window !== 'undefined') {
  storedUserAgent = window.navigator.userAgent;

  Object.defineProperty(window.navigator, "userAgent", ((value: string) => ({
    get() { return value; },
    set(v: string) { value = v; }
  }))(window.navigator['userAgent']));
}

export function setUserAgent (newUserAgent?: string) {
  if (typeof window !== 'undefined') {
    (window.navigator as any).userAgent = newUserAgent || storedUserAgent;
  }
};
