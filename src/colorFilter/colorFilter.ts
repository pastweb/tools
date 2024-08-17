// this is a refactory in typescript of https://codepen.io/sosuke/pen/Pjoqqp

import { SassString, SassList } from 'sass';
import { Color } from './Color';
import { Solver } from './Solver';

type DartValue = {
  dartValue: Record<string, any>;
};

/**
 * Generates a CSS filter for a given color using the Solver and Color classes.
 *
 * @param {DartValue} color - An object containing color values in its `dartValue` property.
 * @param {number} color.dartValue._color1$_red - The red component of the color (0-255).
 * @param {number} color.dartValue._color1$_green - The green component of the color (0-255).
 * @param {number} color.dartValue._color1$_blue - The blue component of the color (0-255).
 * @returns {SassList} - A SassList object containing the CSS filter as a list of SassString objects.
 */
export function colorFilter(color: DartValue): SassList {
  const red = color.dartValue['_color1$_red'];
  const green = color.dartValue['_color1$_green'];
  const blue = color.dartValue['_color1$_blue'];

  const solver = new Solver(new Color(red, green, blue));
  const result = solver.solve();
  
  const filterStrings = result.filter.split(' ').map(s => new SassString(s, { quotes: false }));
  const list = new SassList(filterStrings, { separator: ' ' });

  return list;
}
