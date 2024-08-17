import { Portal, PortalTools } from '../types';

export function toolsConstructor(portal: Portal, component: any, props?: Record<string, any> | (() => Record<string, any>), defaults?: Record<string, any>): PortalTools {
  const { open, update, close, remove, setOnRemove } = portal;
  
  const tools: PortalTools = {
    id: false,
    open: openPortal,
    update: updatePortal,
    close: closePortal,
    remove: removePortal,
    onRemove: (fn: () => void) => setOnRemove(fn),
  };

  function openPortal(): string | false {
    tools.id = open(component, props, defaults);
    return tools.id;
  }

  function updatePortal(props: Record<string, any>): boolean {
    if (tools.id) return update(tools.id, props);
    return false;
  }

  function closePortal(): void {
    if (tools.id) close(tools.id);
  }

  function removePortal(): boolean {
    
    if (tools.id) {
      if (remove(tools.id)) {
        tools.id = false;
        return true;
      }

      return false;
    }

    return false;
  }

  return tools;
}
