import { describe, it, expect, vi } from 'vitest';
import { createNewEntry } from './util';
import { INITIAL_VALUE } from './constants';

const functions = {
  update: vi.fn()
};

describe('given the Entry abstraction on web', () => {
  const entryElement = document.querySelector('body') as HTMLElement;
  const firstEntry = createNewEntry({ entryElement, className: 'firstEntry' });
  const { body } = document;

  describe('given mount event on firstEntry', () => {
    firstEntry.emit('mount');

    it('when mount is emitted for firstEntry, then body contains at least one child node', () => {  
      expect(body.childNodes.length).toBeGreaterThanOrEqual(1);
    });

    it('when mount emitted, then the .firstEntry html node exists in dom', () => {
      const node = document.querySelector('.firstEntry') as HTMLElement;
      expect(node !== null).toBe(true);
    });

    it('when mount emitted for firstEntry, then the element is a DIV', () => {
      const node = document.querySelector('.firstEntry') as HTMLElement;
      expect(node.tagName).toBe('DIV');
    });

    it('when mount emitted for firstEntry, then the div has class "firstEntry"', () => {
      const node = document.querySelector('.firstEntry') as HTMLElement;
      expect(node.className).toBe('firstEntry');
    });

    it('when mount emitted for firstEntry, then the div innerHTML equals INITIAL_VALUE', () => {
      const node = document.querySelector('.firstEntry') as HTMLElement;
      expect(node.innerHTML).toBe(INITIAL_VALUE);
    });
  });

  describe('given update event on secondEntry', () => {
    const secondEntry = createNewEntry({ entryElement, className: 'secondEntry' });
    const spyEvent = vi.spyOn(functions, 'update');
    const spyMethod = vi.spyOn(secondEntry, 'update');
    secondEntry.on('update', functions.update);

    secondEntry.emit('mount');
    secondEntry.emit('update', 'newValue');

    it('after update emit on secondEntry, then the .secondEntry html node exists', () => {
      const node = document.querySelector('.secondEntry') as HTMLElement;
      expect(node !== null).toBe(true);
    });

    it('after update emit on secondEntry, then the node is a DIV', () => {
      const node = document.querySelector('.secondEntry') as HTMLElement;
      expect(node.tagName).toBe('DIV');
    });

    it('after update emit on secondEntry, then the div has class "secondEntry"', () => {
      const node = document.querySelector('.secondEntry') as HTMLElement;
      expect(node.className).toBe('secondEntry');
    });

    it('after update emit with newValue on secondEntry, then the div innerHTML is "newValue"', () => {
      const node = document.querySelector('.secondEntry') as HTMLElement;
      expect(node.innerHTML).toBe('newValue');
    });

    it('after emitting update on secondEntry, then the registered update listener function is called', () => {
      expect(spyEvent).toHaveBeenCalled();
    });

    it('after emitting update on secondEntry, then the spied update method on the entry is called', () => {
      expect(spyMethod).toHaveBeenCalled();
    });
  });

  describe('given unmount event on thirdEntry', () => {
    const thirdEntry = createNewEntry({ entryElement, className: 'thirdEntry' });
    thirdEntry.emit('mount');
    thirdEntry.emit('unmount');

    it('when unmount is emitted for thirdEntry, then the .thirdEntry div no longer exists in the document', () => {
      const node = document.querySelector('.thirdEntry');
      expect(node).toBe(null);
    });
  });
});
