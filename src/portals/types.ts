import { Entry } from '../createEntry';
import { IdCache } from '../createIdCache';

export type Portals = {
  [portalId: string]: { [entryId: string]: Entry<any> };
};

export type PortalTools = {
  id: string | false;
  open: () => string | false;
  update: (props: Record<string, any>) => boolean;
  close: () => void;
  remove: () => boolean;
  onRemove: (fn: () => void) => void;
};

export type ToolsConstructor = (
  portal: Portal,
  component: any,
  props?: Record<string, any> | (() => Record<string, any>),
  defaults?: Record<string, any>,
) => PortalTools;

export type Portal = {
  $$portal: true;
  open: (component: any, props?: Record<string, any> | (() => Record<string, any>), defaults?: Record<string, any>) => string | false;
  update: (entryId: string, entryData: any) => boolean;
  close: (entryId: string) => void;
  remove: (entryId: string) => boolean;
  setIdCache: (idCahche: IdCache) => void;
  setPortalElement: (portalElement: HTMLElement | (() => HTMLElement)) => void;
  setPortalsCache: (portalsCache: Portals) => void;
  setOnRemove: (fn: (entryId: string) => void) => void;
};

export declare function portalFunction(component: any, props?: Record<string, any> | (() => Record<string, any>), defaults?: Record<string, any>,): PortalTools
export declare namespace portalFunction {
  const open: (component: any, props?: Record<string, any> | (() => Record<string, any>) | undefined, defaults?: Record<string, any> | undefined) => string | false;
  const update: (entryId: string, props: Record<string, any>) => boolean;
  const close: (entryId: string) => void;
  const remove: (entryId: string) => boolean;
  const getEntryId: () => string;
  const removeEntryId: (id: string) => void;
};

export type PortalFunction = typeof portalFunction;

export type PortalsMap = Record<string, Portal>;

export interface PortalsDescriptor {
  [pathName: string]: Portal | PortalsDescriptor | typeof portalFunction;
};

export interface EntryDescriptor {
  [ pathName: string]: EntryDescriptor | ((props: Record<string, any>, component: any) => Entry<any>);
};

export interface AnchorsDescriptor {
  [ pathName: string ]: AnchorsDescriptor | HTMLElement | (() => HTMLElement);
};

export interface PortalAnchorsIds {
  [ pathName: string ]: string | PortalAnchorsIds;
};

export type PortalAnchors = string[] | AnchorsDescriptor;
