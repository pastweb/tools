
import { isObject, createPortal } from '../../src';
import { createNewEntry } from './util';

describe('createPortal', () => {
  const rootPortal = document.createElement('div');
  const portalId = 'rootPortal';
  rootPortal.id = portalId;
  document.body.appendChild(rootPortal);

  const portal = createPortal(() => createNewEntry({ className: 'newEntry' }));
  portal.setPortalElement(rootPortal);

  it('portal shuold be al object', () => {
    expect(isObject(portal)).toBe(true);
  });

  it('open should be fefined and should be a function', () => {
    const type = typeof portal.open;
    expect(type !== 'undefined').toBe(true);
    expect(type === 'function').toBe(true);
  });

  it('update should be fefined and should be a function', () => {
    const type = typeof portal.update;
    expect(type !== 'undefined').toBe(true);
    expect(type === 'function').toBe(true);
  });

  it('close should be fefined and should be a function', () => {
    const type = typeof portal.close;
    expect(type !== 'undefined').toBe(true);
    expect(type === 'function').toBe(true);
  });
});
