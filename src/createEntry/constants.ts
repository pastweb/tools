export const ENTRY = Symbol();

export const READ_ONLY_PROPS = [
  'on',
  'emit',
  'removeListener',
  'memoSSR',
  'getComposedSSR',
  'setEntryElement',
  'setQuerySelector',
  'setOptions',
  'mergeOptions',
  'setEntryComponent',
];

export const METHODS = ['mount', 'update', 'unmount'];
