import { Portal, PortalHandler } from '../types';

export function handlerConstructor(portal: Portal, component: any, props?: Record<string, any> | (() => Record<string, any>), defaults?: Record<string, any>): PortalHandler {
  const { open, update, close, remove, setOnRemove } = portal;
  
  const handler: PortalHandler = {
    id: false,
    open: openPortal,
    update: updatePortal,
    close: closePortal,
    remove: removePortal,
    onRemove: (fn: () => void) => setOnRemove(fn),
  };

  function openPortal(): string | false {
    handler.id = open(component, props, defaults);
    return handler.id;
  }

  function updatePortal(props: Record<string, any>): boolean {
    if (handler.id) return update(handler.id, props);
    return false;
  }

  function closePortal(): void {
    if (handler.id) close(handler.id);
  }

  function removePortal(): boolean {
    
    if (handler.id) {
      if (remove(handler.id)) {
        handler.id = false;
        return true;
      }

      return false;
    }

    return false;
  }

  return handler;
}
