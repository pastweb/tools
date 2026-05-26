import type { UseMicroStore } from './types';

export const STORE_REGISTRY = new Map<string, UseMicroStore<any, any>>();
