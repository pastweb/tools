import { getPortalElement } from './getPortalElement';

export function close(portalElement: HTMLElement | (() => HTMLElement), entryId: string): void {
  const element = getPortalElement(portalElement);

  element.dispatchEvent(new CustomEvent('close', { detail: { entryId }}));
}
