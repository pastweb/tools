import { describe, it, expect } from 'vitest';
import { open, update, close, remove } from '../../src/portals/util';
import { createNewEntry } from './util';
import { setCurrentPortalsCache, type Portals } from '../../src';
import { INITIAL_VALUE } from './constants';

const portals: Portals = {};
setCurrentPortalsCache(portals);

const portalElement = document.createElement('div') as HTMLElement;
const portalId = 'rootPortal';
portalElement.id = portalId;
document.body.appendChild(portalElement);

const getPortalElement = () => portalElement;
const firstEntry = createNewEntry({ className: 'firstEntry' });

const secondEntry = createNewEntry({
  className: 'secondEntry',
  initData: { initValue: 'passedValue'},
});

const firstEntryId: string | false = open(getPortalElement, firstEntry);
const secondEntryId: string | false = open(getPortalElement, secondEntry);

describe('given the portal util functions', () => {
  describe('given open invoked at top level to create entries before tests', () => {
    it('given two portal entries created at module load, when checking the root portal element, then it should contain 2 child nodes', () => {
      expect(portalElement.childNodes.length).toBe(2);
    });

    it('given the first entry created at load, when checking portals under portalId, then firstEntryId should be inside it', () => {
      expect(
        Object.keys(portals[portalId]).includes(firstEntryId as string)
      ).toBe(true);
    });

    it('given the second entry created at load, when checking portals under portalId, then secondEntryId should be inside it', () => {
      expect(
        Object.keys(portals[portalId]).includes(secondEntryId as string)
      ).toBe(true);
    });

    it(`given the first entry created at load, when checking the DOM, then the element with id="${firstEntryId}" should be present into the DOM`, () => {
      expect(
        typeof document.getElementById(firstEntryId as string) !== null
      ).toBe(true);
    });

    it(`given the second entry created at load, when checking the DOM, then the element with id="${secondEntryId}" should be present into the DOM`, () => {
      expect(
        typeof document.getElementById(secondEntryId as string) !== null
      ).toBe(true);
    });

    it(`given the second entry created at load, when checking the DOM again, then the element with id="${secondEntryId}" should be present into the DOM`, () => {
      const element = document.getElementById(secondEntryId as string) as HTMLElement;
      
      expect(typeof element !== null).toBe(true);
    });

    it('given the first entry created at load with class firstEntry, when checking the DOM, then the element with class "firstEntry" should be present and contain the "INIT_VALUE"', () => {
      const element = document.querySelector('.firstEntry') as HTMLElement;
      
      expect(typeof element !== null).toBe(true);
      expect(element.innerHTML === INITIAL_VALUE).toBe(true);
    });

    it('given the second entry created at load with class secondEntry, when checking the DOM, then the element with class "secondEntry" should be present and contain the "passedValue"', () => {
      const element = document.querySelector('.secondEntry') as HTMLElement;

      expect(typeof element !== null).toBe(true);
      expect(element.innerHTML === 'passedValue').toBe(true);
    });
  });

  describe('given update invoked after the initial open setup', () => {
    it('given the first entry exists, when update is called with new data for it, then the FirstEntry should contain the "newFirstEntryValue"', () => {
      update(getPortalElement, firstEntryId as string, 'newFirstEntryValue');
      
      const element = document.querySelector('.firstEntry') as HTMLElement;
      
      expect(typeof element !== null).toBe(true);
      expect(element.innerHTML).toBe('newFirstEntryValue');
    });

    it('given the second entry exists, when update is called with new data for it, then the SecondEntry should contain the "newSecondEntryValue"', () => {
      update(getPortalElement, secondEntryId as string, 'newSecondEntryValue');
      
      const entryElement = document.getElementById(secondEntryId as string) as HTMLElement;
      const element = document.querySelector('.secondEntry') as HTMLElement;
      
      expect(typeof entryElement !== null).toBe(true);
      expect(typeof element !== null).toBe(true);
      expect(element.innerHTML).toBe('newSecondEntryValue');
    });
  });

  describe('given remove invoked after the initial open and update setup', () => {
    it('given the first entry exists in DOM, when remove is called for it, then the firstEntry portal element should not be present', async () => {
      remove(getPortalElement, firstEntryId as string);
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(document.getElementById(firstEntryId as string)).toBe(null);
    });

    it('given the second entry exists in DOM, when remove is called for it, then the secondEntry portal element should not be present', async () => {
      remove(getPortalElement, secondEntryId as string);
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(document.getElementById(secondEntryId as string)).toBe(null);
    });
  });
});
