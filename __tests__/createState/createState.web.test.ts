import { createState } from '../../src';
import { update } from '../../src/update';

// Mock the update function to avoid actual state mutation
jest.mock('../../src/update', () => ({
  update: jest.fn(),
}));

describe('createState', () => {
  it('should initialize state with an object', () => {
    const initialState = { a: 1, b: 2 };
    const { state } = createState(initialState);

    expect(state).toEqual(initialState);
  });

  it('should initialize state with a function', () => {
    const initialStateFunction = () => ({ a: 1, b: 2 });
    const { state } = createState(initialStateFunction);

    expect(state).toEqual(initialStateFunction());
  });

  it('should call onStateChange when state is updated', () => {
    const initialState = { a: 1, b: 2 };
    const onStateChange = jest.fn();
    const { setState } = createState(initialState, onStateChange);

    const newState = { b: 3 };
    setState(newState);

    expect(update).toHaveBeenCalledWith(initialState, newState);
    expect(onStateChange).toHaveBeenCalledWith(initialState);
  });

  it('should merge initial state and partial state', () => {
    const initialState = { a: 1, b: 2 };
    const { state, setState } = createState(initialState);

    const newState = { b: 3 };
    setState(newState);

    // Ensure the mocked update function was called correctly
    expect(update).toHaveBeenCalledWith(initialState, newState);
  });

  it('should not call onStateChange if it is not provided', () => {
    const initialState = { a: 1, b: 2 };
    const { setState } = createState(initialState);

    const newState = { b: 3 };
    setState(newState);

    // Ensure the mocked update function was called correctly
    expect(update).toHaveBeenCalledWith(initialState, newState);
  });

  it('should handle initial state function returning empty object', () => {
    const initialStateFunction = () => ({});
    const { state } = createState(initialStateFunction);

    expect(state).toEqual(initialStateFunction());
  });

  it('should handle empty initial state object', () => {
    const { state } = createState();

    expect(state).toEqual({});
  });
});
