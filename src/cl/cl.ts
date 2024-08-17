import clsx, { ClassValue } from 'clsx';
import { isObject } from '../isObject';
import { Mode, ERROR_MESSAGE } from './constants';
import { CSSModuleClasses } from './types';

/**
 * Combines class names using the `clsx` library.
 *
 * @param {...ClassValue} args - A list of class values to combine.
 * @returns {string} - The combined class names as a string.
 */
export function cl(...args: ClassValue[]): string {
  return clsx(...args);
}

/**
 * Sets custom CSS module classes and returns a function to combine class names with these classes.
 *
 * @param {CSSModuleClasses | CSSModuleClasses[]} [classes={}] - The CSS module classes to use.
 * @param {Mode | 'merge' | 'replace'} [mode=Mode.merge] - The mode for combining classes: 'merge' or 'replace'.
 * @returns {(...args: ClassValue[]) => string} - A function that takes class values and returns combined class names.
 * 
 * @throws {Error} - Throws an error if a provided class is not an object.
 */
cl.setClasses = (classes: CSSModuleClasses | CSSModuleClasses[] = {}, mode: Mode | 'merge' | 'replace' = Mode.merge) => (...args: ClassValue[]): string => {
  classes = Array.isArray(classes) ? classes : [ classes ];
  let result = '';
  const classNames = clsx(...args).split(' ');
  
  classNames.forEach(name => {
    let className = '';

    (classes as CSSModuleClasses[]).forEach(cls => {
      if (!isObject(cls)) {
        throw Error(ERROR_MESSAGE);
      }

      if (cls[name]) {
        className = mode === Mode.replace ? cls[name] : className.length ? `${className} ${cls[name]}` : cls[name];
      }
    });

    className = className || name;
    result = `${result}${result.length ? ` ${className}` : className}`;
  });

  return [...new Set(result.split(' '))].join(' ');
};
