import { isObject } from '../isObject';
/**
 * Deep merge two or more objects.
 * @param target
 * @param ...sources
 */

export function deepMerge(...sources: { [key: string]: any }[]): {
  [key: string]: any;
} {
  if (!sources.length) return {};
  return sources.reduce((acc, curr) => {
    if (isObject(curr)) {
      Object.keys(curr).forEach((key) => {
        const accVal = acc[key];
        const currVal = curr[key];

        if (Array.isArray(accVal) && Array.isArray(currVal)) {
          let newArr = [];
          
          for(let i=0; i < accVal.length; i++) {
            if (!currVal[i]) {
              newArr = newArr.concat(...accVal.slice(i));
              break;
            }
            if ((isObject(accVal[i]) && isObject(currVal[i]))) {
              newArr.push(deepMerge(accVal[i], currVal[i]));
            } else {
              newArr.push(currVal[i]);
            }
          }

          if (currVal.length > accVal.length) {
            newArr = newArr.concat(...currVal.slice(newArr.length));
          }

          acc[key] = newArr;
        } else if (isObject(accVal) && isObject(currVal)) {
          acc[key] = deepMerge(accVal, currVal);
        } else {
          acc[key] = currVal;
        }
      });
    }

    return acc;
  }, {});
}
