import { ClassValue } from 'clsx';
import type { Mode } from './constants';

export type CSSModuleClasses = Record<string, string>;

export interface ClassProcessor {
  (...args: ClassValue[]): string;
  setClasses: (classes: CSSModuleClasses | CSSModuleClasses[], mode?: Mode | 'merge' | 'replace') => ClassProcessor;
};
