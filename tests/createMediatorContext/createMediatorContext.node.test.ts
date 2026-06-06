import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMediatorContext, getContext, setContext, type Context } from '../../src';

describe('createMediatorContext', () => {
  let context: Context;
  beforeEach(() => {
    const contextStore: Record<string, any> = {};

    context = {
      getContext: vi.fn((key: string) => contextStore[key]),
      setContext: vi.fn((key: string, value: any) => {
        contextStore[key] = value;
      }),
    };
  });

  it('executes the mediator function and returns its result', () => {
    const mediator = vi.fn((props) => ({ result: props.value * 2 }));
    const result = createMediatorContext(mediator, { value: 5 }, {}, context);

    expect(result).toEqual({ result: 10 });
  });

  it('provides context with getContext and setContext', () => {
    const mediator = vi.fn((props, extras) => {
      setContext('user', { name: 'John' });
      const user = getContext<{ name: string }>('user');
      return { user };
    });

    const m = createMediatorContext(mediator, {}, {}, context);

    expect(m.user).toEqual({ name: 'John' });
  });

  it('gets and sets context values', () => {
    const mediator = () => {
      setContext('test', 'test-value');
      const value = getContext('test');
      return { value };
    };

    const m =createMediatorContext(mediator, {}, {}, context);

    expect(vi.spyOn(context, 'setContext')).toHaveBeenCalledWith('test', 'test-value');
    expect(vi.spyOn(context, 'getContext')).toHaveBeenCalledWith('test');
    expect(m.value).toBe('test-value');
  });
});
