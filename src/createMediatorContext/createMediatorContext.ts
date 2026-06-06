import type { Context, Extras, MediatorFunction, Props } from './types';

const contextCache: WeakMap<MediatorFunction, Context> = new WeakMap();

let currentMediator: MediatorFunction<any> | null = null;

export function createMediatorContext<T>(mediator: MediatorFunction<T>, props: Props = {}, extras: Extras = {}, context: Context): any & T {
  contextCache.set(mediator, context);

  const previousMediator = currentMediator;
  currentMediator = mediator;

  try {
    return mediator(props, extras);
  } finally {
    currentMediator = previousMediator;
  }
}

export function getContext<T = any>(key: string): T | undefined {
  if (currentMediator === null) {
    throw new Error(
      'getContext() can only be called synchronously inside a mediator function body (during creation via createMediator).'
    );
  }

  const ctx = contextCache.get(currentMediator);
  if (!ctx) {
    throw new Error('Internal error: no context cached for the current mediator.');
  }

  return ctx.getContext<T>(key);
}

export function setContext<T = any>(key: string, value: T): void {
  if (currentMediator === null) {
    throw new Error(
      'setContext() can only be called synchronously inside a mediator function body (during creation via createMediator).'
    );
  }

  const ctx = contextCache.get(currentMediator);
  if (!ctx) {
    throw new Error('Internal error: no context cached for the current mediator.');
  }

  ctx.setContext<T>(key, value);
}
