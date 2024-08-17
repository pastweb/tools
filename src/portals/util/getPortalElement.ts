export function getPortalElement(portalElement: HTMLElement | (() => HTMLElement)): HTMLElement {
  return typeof portalElement === 'function' ? portalElement() : portalElement as HTMLElement;
}
