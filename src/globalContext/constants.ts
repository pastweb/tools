import { reactive } from '../reactivity';
import { setAsGlobalContext } from './setAsGlobalContext';
import type { GlobalContext } from './types';

/**
 * Symbol used to identify a global context object.
 */
export const GLOBAL_CONTEXT_TYPE = Symbol('GLOBAL_CONTEXT_TYPE');

/**
 * Reactive global context object shared across the application.
 * 
 * This is the main global context instance that can be extended with
 * application-wide state, configurations, or services.
 */
export const globalContext = reactive<GlobalContext>({});

/**
 * Marks the globalContext object with the GLOBAL_CONTEXT_TYPE symbol.
 */
setAsGlobalContext(globalContext);
