import { createNewEntry } from './util';
import { INITIAL_VALUE } from './constants';

const functions = {
  update: jest.fn()
};

describe('Entry', () => {
  const entryElement = document.querySelector('body') as HTMLElement;
  const firstEntry = createNewEntry({ entryElement, className: 'firstEntry' });
  const { body } = document;

  describe('mount', () => {
    firstEntry.emit('mount');

    it('the body element should contains a single node', () => {  
      expect(body.childNodes.length).toBeGreaterThanOrEqual(1);
    });

    it('the html node should be not null', () => {
      const node = document.querySelector('.firstEntry') as HTMLElement;
      expect(node !== null).toBe(true);
    });

    it('the body node element be a div', () => {
      const node = document.querySelector('.firstEntry') as HTMLElement;
      expect(node.tagName).toBe('DIV');
    });

    it('the div element must have the class "firstEntry"', () => {
      const node = document.querySelector('.firstEntry') as HTMLElement;
      expect(node.className).toBe('firstEntry');
    });

    it('the div element content should be equal to INITIAL_VALUE constant', () => {
      const node = document.querySelector('.firstEntry') as HTMLElement;
      expect(node.innerHTML).toBe(INITIAL_VALUE);
    });
  });

  describe('update', () => {
    const secondEntry = createNewEntry({ entryElement, className: 'secondEntry' });
    const spyEvent = jest.spyOn(functions, 'update');
    const spyMethod = jest.spyOn(secondEntry, 'update');
    secondEntry.on('update', functions.update);

    secondEntry.emit('mount');
    secondEntry.emit('update', 'newValue');

    it('the html node should be not null', () => {
      const node = document.querySelector('.secondEntry') as HTMLElement;
      expect(node !== null).toBe(true);
    });

    it('the body node element be a div', () => {
      const node = document.querySelector('.secondEntry') as HTMLElement;
      expect(node.tagName).toBe('DIV');
    });

    it('the div element must have the class "secondEntry"', () => {
      const node = document.querySelector('.secondEntry') as HTMLElement;
      expect(node.className).toBe('secondEntry');
    });

    it('the div element content should be equal to "newValue" constant', () => {
      const node = document.querySelector('.secondEntry') as HTMLElement;
      expect(node.innerHTML).toBe('newValue');
    });

    it('the function update should be called', () => {
      expect(spyEvent).toBeCalled();
    });

    it('the method update should be called', () => {
      expect(spyMethod).toBeCalled();
    });
  });

  describe('unmount', () => {
    const thirdEntry = createNewEntry({ entryElement, className: 'thirdEntry' });
    thirdEntry.emit('mount');
    thirdEntry.emit('unmount');

    it('the div element with the class "thirdEntry" should not exists', () => {
      const node = document.querySelector('.thirdEntry');
      expect(node).toBe(null);
    });
  });
});
