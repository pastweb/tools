import type { ContextUtils, Extras, MediatorFunction, Props } from './types';

const contextCache: WeakMap<MediatorFunction, ContextUtils> = new WeakMap();

let currentMediator: MediatorFunction<any> | null = null;

/**
 * Creates and executes a mediator function with an associated context.
 *
 * This function temporarily sets the current mediator and context in the internal cache,
 * executes the mediator, and ensures proper cleanup even if an error occurs.
 *
 * @param mediator - The mediator function to execute.
 * @param props - Props to pass to the mediator function.
 * @param extras - Extra data to pass to the mediator function.
 * @param context - The context utilities (`getContext` and `setContext`).
 * @returns The result of the mediator function execution.
 */
export function createMediatorContextUtils<T>(mediator: MediatorFunction<T>, props: Props = {}, extras: Extras = {},context: ContextUtils): any & T {
  contextCache.set(mediator, context);

  const previousMediator = currentMediator;
  currentMediator = mediator;

  try {
    return mediator(props, extras);
  } finally {
    currentMediator = previousMediator;
  }
}

/**
 * Retrieves the context utilities (`getContext` and `setContext`) for the currently executing mediator.
 *
 * This function can only be called synchronously from within a mediator function body
 * that was executed via `createMediatorContextUtils`.
 *
 * @returns An object containing `getContext` and `setContext` functions bound to the current mediator's context.
 * @throws {Error} If called outside of a mediator function.
 * 
 * @example
 * ```ts
 * import { getContextUtils } from '@pastweb/tools';
 * 
 * function mediator(props) {
 *   const { getContext, setContext } = getContextUtils();
 *
 *   setContext('theme', 'dark');
 *   setContext('user', { id: 1, name: 'Alice' });
 *
 *   const theme = getContext('theme');
 *   const user = getContext<{ id: number; name: string }>('user');
 *
 *   return { theme, user };
 * }
 * ```
 */
export function getContextUtils(): ContextUtils {
  if (currentMediator === null) {
    throw new Error(
      'getContextUtils() can only be called synchronously inside a mediator function body.'
    );
  }

  const ctx = contextCache.get(currentMediator);
  if (!ctx) {
    throw new Error('Internal error: no context cached for the current mediator.');
  }

  return {
    getContext: ctx.getContext,
    setContext: ctx.setContext,
  };
}
