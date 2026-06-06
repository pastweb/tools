import type { Entry } from '../createEntry';

export type Portals = {
  [portalId: string]: { [entryId: string]: Entry<any> | true };
};

export type PortalHandler = {
  id: string | false;
  getPortalElement: () => HTMLElement;
  portal: Portal;
  open: () => string | false;
  update: (props: Record<string, any>) => boolean;
  close: () => void;
  remove: () => boolean;
  onRemove: (fn: () => void) => void;
};

export type HandlerConstructor = (
  portal: Portal,
  component: any,
  props?: Record<string, any> | (() => Record<string, any>),
  defaults?: Record<string, any>,
) => PortalHandler;

export type Portal = {
  open: (component: any, props?: Record<string, any> | (() => Record<string, any>), defaults?: Record<string, any>) => string | false;
  update: (entryId: string, entryData: any) => boolean;
  close: (entryId: string) => void;
  remove: (entryId: string) => boolean;
  getPortalElement: () => HTMLElement;
  setOnRemove: (fn: (entryId: string) => void) => void;
};

export type PortalFunction = ((component: any, props?: Record<string, any> | (() => Record<string, any>), defaults?: Record<string, any>,) => PortalHandler) & {
  update: (entryId: string, props: Record<string, any>) => boolean;
  close: (entryId: string) => void;
  remove: (entryId: string) => boolean;
  getEntryId: () => string;
  removeEntryId: (id: string) => void;
};

export type PortalsMap = Record<string, Portal>;

export interface PortalsDescriptor {
  [pathName: string]: Portal | PortalsDescriptor | PortalFunction;
};

export interface AnchorsDescriptor {
  [pathName: string]: AnchorsDescriptor | HTMLElement | (() => HTMLElement);
};

export interface PortalAnchorsIds {
  [pathName: string]: string;
};

export type PortalAnchors = string[] | AnchorsDescriptor;
