import { createEntry, EntryOptions, Entry } from '../../src';
import { INITIAL_VALUE } from './constants';

type NewOptions = EntryOptions & {
  className: string;
};

type NewEntry = Omit <Entry<NewOptions>, 'mount'| 'update' | 'unmount'> & {
  mount: () => void;
  update: (value: any) => void;
  unmount: () => void;
}

export function createNewEntry(options: NewOptions): NewEntry {
  const entry = createEntry(options);
  let _node: HTMLElement | undefined = undefined;
  
  entry.mount = () => {
    const node = document.createElement('div');
    node.className = entry.options.className;
    node.innerHTML = entry.options.initData?.initValue || INITIAL_VALUE;
    _node = node;
    
    if (_node && entry.entryElement) {
      entry.entryElement.appendChild(_node);
    }
  };

  entry.unmount = () => {
    if (_node) _node.remove();
  };

  entry.update = (value: any) => {
    if (_node) {
      _node.innerHTML = value;
    }
  };

  return entry as unknown as NewEntry;
}
