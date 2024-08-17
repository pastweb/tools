import { deepMerge } from '../deepMerge';
import { noop } from '../noop';
import { update } from '../update';
import { InitiaStateFunction } from './types';

/**
 * Creates a state management utility.
 *
 * @template State - The type of the state object.
 * 
 * @param {State | InitiaStateFunction<State>} [initialState={}] - The initial state object or a function that returns the initial state.
 * @param {function} [onStateChange=noop] - Callback function that is called whenever the state changes.
 * 
 * @returns {{
*   state: State;
*   setState: (state: Partial<State>) => void;
* }} An object containing the current state and a function to update the state.
*/
export function createState<State>(
  initialState: State | InitiaStateFunction<State> = {} as State,
  onStateChange: (state: State) => void = noop
): {
  state: State;
  setState: (state: Partial<State>) => void;
} {
  const state = typeof initialState == 'function' ?
    deepMerge({}, (initialState as InitiaStateFunction<State>)() as Record<string, any>) as State :
    deepMerge({}, initialState as Record<string, any>) as State;
  
  const setState = (newState: Partial<State>) => {
    update<State>(state, newState);
    onStateChange(state);
  };
  
  return { state, setState };
}
