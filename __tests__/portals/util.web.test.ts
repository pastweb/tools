import { open, update, close, remove } from '../../src/portals/util';
import { createNewEntry } from './util';
import { createIdCache, type Portals } from '../../src';
import { INITIAL_VALUE } from './constants';

const portals: Portals = {};
const idCache = createIdCache();

const portalElement = document.createElement('div') as HTMLElement;
const portalId = 'rootPortal';
portalElement.id = portalId;
document.body.appendChild(portalElement);

const firstConfig = {
  portalElement,
  idCache,
  entry: createNewEntry({ className: 'firstEntry' })
};

const secondConfig = {
  portalElement,
  idCache,
  entry: createNewEntry({
    className: 'secondEntry',
    initData: { initValue: 'passedValue'},
  }),
};

const firstEntryId: string | false = open(portals, firstConfig);
const secondEntryId: string | false = open(portals, secondConfig);

describe('portal - util', () => {
  describe('open', () => {
    it('rootPortalElement should contains 2 childNode', () => {
      expect(portalElement.childNodes.length).toBe(2);
    });

    it('firstEntryId should be inside portals[portalId]', () => {
      expect(
        Object.keys(portals[portalId]).includes(firstEntryId as string)
      ).toBe(true);
    });

    it('secondEntryId should be inside portals[portalId]', () => {
      expect(
        Object.keys(portals[portalId]).includes(secondEntryId as string)
      ).toBe(true);
    });

    it(`the element with id="${firstEntryId}" should be present into the DOM`, () => {
      expect(
        typeof document.getElementById(firstEntryId as string) !== null
      ).toBe(true);
    });

    it(`the element with id="${secondEntryId}" should be present into the DOM`, () => {
      expect(
        typeof document.getElementById(secondEntryId as string) !== null
      ).toBe(true);
    });

    it(`the element with id="${secondEntryId}" should be present into the DOM.`, () => {
      const element = document.getElementById(secondEntryId as string) as HTMLElement;
      
      expect(typeof element !== null).toBe(true);
    });

    it('the element with class "firstEntry" should be present and contains the "INIT_VALUE"', () => {
      const element = document.querySelector('.firstEntry') as HTMLElement;
      
      expect(typeof element !== null).toBe(true);
      expect(element.innerHTML === INITIAL_VALUE).toBe(true);
    });

    it('the element with class "secontEntry" should be present and contains the "passedValue"', () => {
      const element = document.querySelector('.secondEntry') as HTMLElement;

      expect(typeof element !== null).toBe(true);
      expect(element.innerHTML === 'passedValue').toBe(true);
    });
  });

  describe('update', () => {
    it('the FirstEntry should contains the "newFirstEntryValue"', () => {
      update(portals, {
        portalElement,
        entryId: firstEntryId as string,
        entryData: 'newFirstEntryValue'
      });
      
      const element = document.querySelector('.firstEntry') as HTMLElement;
      
      expect(typeof element !== null).toBe(true);
      expect(element.innerHTML).toBe('newFirstEntryValue');
    });

    it('the SecondEntry should contains the "newSecondEntryValue".', () => {
      update(portals, { portalElement, entryId: secondEntryId as string, entryData: 'newSecondEntryValue' });
      
      const entryElement = document.getElementById(secondEntryId as string) as HTMLElement;
      const element = document.querySelector('.secondEntry') as HTMLElement;
      
      expect(typeof entryElement !== null).toBe(true);
      expect(typeof element !== null).toBe(true);
      expect(element.innerHTML).toBe('newSecondEntryValue');
    });
  });

  describe('remove', () => {
    it('the firstEntry portal element should be not present', () => {
      remove(portals, { portalElement, entryId: firstEntryId as string, idCache });
      expect(document.getElementById(firstEntryId as string)).toBe(null);
    });

    it('the secondEntry portal element should be not present', () => {
      remove(portals, { portalElement, entryId: secondEntryId as string, idCache });
      expect(document.getElementById(secondEntryId as string)).toBe(null);
    });
  });
});
