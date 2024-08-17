import { FullElementSize } from './types';

export enum ATTRIB {
  width = 'width',
  borderLeftWidth = 'borderLeftWidth',
  marginLeft = 'marginLeft',
  marginRight = 'marginRight',
  borderRightWidth = 'borderRightWidth',
  height = 'height',
  borderTopWidth = 'borderTopWidth',
  marginTop = 'marginTop',
  marginBottom = 'marginBottom',
  borderBottomWidth = 'borderBottomWidth',
};

export const ATTRIBS: Record<string, ATTRIB[]> = {
  width: [
    ATTRIB.width,
    ATTRIB.borderLeftWidth,
    ATTRIB.marginLeft,
    ATTRIB.marginRight,
    ATTRIB.borderRightWidth,
  ],
  height: [
    ATTRIB.height,
    ATTRIB.borderTopWidth,
    ATTRIB.marginTop,
    ATTRIB.marginBottom,
    ATTRIB.borderBottomWidth,
  ]
};

export const EMPTY: FullElementSize = { width: 0, height: 0 };
