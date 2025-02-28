import clsx, { ClassValue } from 'clsx';
import { isObject } from '../isObject';
import { Mode, ERROR_MESSAGE } from './constants';
import { CSSModuleClasses, ClassProcessor } from './types';

// Cache for processed class combinations
const classCache = new Map<string, string>();

/**
 * Combines class names using the `clsx` library with caching for improved performance.
 *
 * @param {...ClassValue} args - A list of class values to combine (strings, arrays, objects, etc.)
 * @returns {string} - The combined class names as a string
 * @example
 * // Basic usage
 * cl('foo', 'bar'); // Returns "foo bar"
 * cl('foo', ['bar', 'baz']); // Returns "foo bar baz"
 * cl({ foo: true, bar: false }); // Returns "foo"
 */
export const cl: ClassProcessor = Object.assign(
  (...args: ClassValue[]): string => {
    const cacheKey = JSON.stringify(args);
    if (classCache.has(cacheKey)) {
      return classCache.get(cacheKey)!;
    }
    
    const result = clsx(...args);
    classCache.set(cacheKey, result);
    return result;
  },
  {
    /**
     * Sets custom CSS module classes and returns a function to combine class names with these classes.
     * Includes caching for repeated class combinations.
     *
     * @param {CSSModuleClasses | CSSModuleClasses[]} [classes={}] - CSS module classes to use
     * @param {Mode | 'merge' | 'replace'} [mode=Mode.merge] - Mode for combining classes: 'merge' or 'replace'
     * @returns {(...args: ClassValue[]) => string} - Function that combines class values with module classes
     * @throws {Error} - Throws an error if a provided class is not an object
     * 
     * @example
     * // Basic CSS module usage
     * const styles = { button: 'button_123', active: 'active_456' };
     * const cx = cl.setClasses(styles);
     * cx('button', 'active'); // Returns "button_123 active_456"
     * 
     * // Multiple modules with merge mode
     * const module1 = { foo: 'foo_1' };
     * const module2 = { foo: 'foo_2' };
     * const cxMerge = cl.setClasses([module1, module2], 'merge');
     * cxMerge('foo'); // Returns "foo_1 foo_2"
     * 
     * // Replace mode
     * const cxReplace = cl.setClasses([module1, module2], 'replace');
     * cxReplace('foo'); // Returns "foo_2"
     */
    setClasses: (classes: CSSModuleClasses | CSSModuleClasses[] = {}, mode: Mode | 'merge' | 'replace' = Mode.merge) => {
      // Normalize classes to array
      const normalizedClasses = Array.isArray(classes) ? classes : [classes];
      const processorCache = new Map<string, string>();

      // Create processor function with caching
      const processor = (...args: ClassValue[]): string => {
        const cacheKey = JSON.stringify(args);
        if (processorCache.has(cacheKey)) {
          return processorCache.get(cacheKey)!;
        }

        const classNames = clsx(...args).split(' ');
        let result = '';
        
        classNames.forEach(name => {
          let className = '';
          
          normalizedClasses.forEach(cls => {
            if (!isObject(cls)) {
              throw Error(ERROR_MESSAGE);
            }
            
            if (cls[name]) {
              className = mode === Mode.replace 
                ? cls[name] 
                : className.length 
                  ? `${className} ${cls[name]}`
                  : cls[name];
            }
          });
          
          className = className || name;
          result = `${result}${result.length ? ` ${className}` : className}`;
        });
        
        const processedResult = [...new Set(result.split(' '))].join(' ');
        processorCache.set(cacheKey, processedResult);
        return processedResult;
      };
      
      // Return new processor with setClasses method
      return Object.assign(processor, {
        setClasses: (nextClasses: CSSModuleClasses | CSSModuleClasses[], nextMode: Mode | 'merge' | 'replace' = Mode.merge) => {
          return cl.setClasses(normalizedClasses.concat(nextClasses), nextMode);
        }
      });
    }
  }
);
