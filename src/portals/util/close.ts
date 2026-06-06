export function close(getPortalElement: () => HTMLElement, entryId: string): void {
  const element = getPortalElement();
  element.dispatchEvent(new CustomEvent('close', { detail: { entryId } }));
}
