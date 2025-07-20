import { createEventEmitter } from '../createEventEmitter';
import { deepMerge } from '../deepMerge';
import { noop } from '../noop';
import { isSSR } from '../isSSR';
import { hashID } from '../hashID';
import { READ_ONLY_PROPS, METHODS } from './constants';
import { immutableProperty } from '../immutableProperty';
import type { Entry, EntryOptions } from './types';

const ssrIds = new Set<string>();
let ssrMap: { [ssrKey: string]: Promise<string> } = {};

/**
 * Creates an entry object with event emitter capabilities and various utility methods to be extended for a specific Front end Framework.
 * 
 * @param {O} [options] - Optional configuration options for the entry.
 * @returns {E} The created entry object.
 *
 */
export function createEntry<E extends Entry<O>, O extends EntryOptions>(options?: O): E {
  const _options: O = options || {} as O;
  _options.initData = _options.initData || {};
  
  const emitter = createEventEmitter();
  const on = emitter.on;
  const emit = emitter.emit;
  const removeListener = emitter.removeListener;

  const entry: Entry<O> = {
    $$entry: true,
    EntryComponent: undefined,
    ssrId: undefined,
    querySelector: undefined,
    entryElement: undefined,
    options: _options,
    on,
    emit,
    removeListener,
    memoSSR,
    getComposedSSR,
    setEntryElement,
    setQuerySelector,
    setOptions,
    mergeOptions,
    setEntryComponent,
    mount: noop,
    update: noop,
    unmount: noop,
  };

  setOptions(_options);

  if (isSSR) {
    const ssrId = hashID(ssrIds, { prefix: 'SSR' });
    ssrIds.add(ssrId);
    entry.ssrId = ssrId;
  }

  METHODS.forEach(method => {
    on(method, (...args: any[]) => {
      (entry as any)[method](...args);
    });
  });

  /**
   * Stores the SSR HTML promise function.
   *
   * @param {() => Promise<string>} htmlPromiseFunction - The function that returns an HTML promise.
   */
  function memoSSR(htmlPromiseFunction: () => Promise<string>): void {
    ssrMap[entry.ssrId as string] = htmlPromiseFunction();
  }

  /**
   * Composes the SSR HTML from the stored promises.
   *
   * @returns {Promise<string>} The composed SSR HTML.
   */
  async function getComposedSSR(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const htmlMap: Record<string, string> = Object.entries(ssrMap)
        .reduce(async (acc, [id, promiseHTML]) => ({
          ...acc,
          [id]: await promiseHTML,
        }), {});
        
        const finalRender = Object.entries(htmlMap).reduce((acc, [id, HTML]) => {
          return acc.replace(id, HTML);
        }, '');
  
        resolve(finalRender);
        ssrIds.clear();
        ssrMap = {};
      } catch (e) { reject(e); }
    });
  }

  /**
   * Sets the entry element.
   *
   * @param {HTMLElement} entryElement - The entry element to set.
   */
  function setEntryElement(entryElement: HTMLElement): void {
    entry.entryElement = entryElement;
  }

  /**
   * Sets the query selector.
   *
   * @param {string} querySelector - The query selector to set.
   */
  function setQuerySelector(querySelector: string): void {
    entry.querySelector = querySelector;
  }
 
  /**
   * Sets the options for the entry.
   *
   * @param {O} options - The options to set.
   */
  function setOptions(options: O): void {
    const { entryElement, querySelector, EntryComponent } = options;
    entry.options = options;
    if (entryElement) entry.entryElement = entryElement;
    if (querySelector) entry.querySelector = querySelector;
    if (EntryComponent) entry.EntryComponent = EntryComponent;
  }

  /**
   * Merges the options for the entry.
   *
   * @param {O} options - The options to merge.
   */
  function mergeOptions(options: O): void {
    const newOptions = deepMerge(entry.options || {}, options) as O;
    setOptions(newOptions);
  }

  /**
   * Sets the entry component.
   *
   * @param {any} Component - The component to set as the entry component.
   */
  function setEntryComponent(Component: any): void {
    entry.EntryComponent = Component;
  }

  immutableProperty<Entry<O>>(entry, READ_ONLY_PROPS as Extract<keyof Entry<O>, string>[]);

  return entry as E;
}
