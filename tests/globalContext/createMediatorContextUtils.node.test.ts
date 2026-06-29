import { describe, it, expect, vi } from 'vitest';
import { createMediatorContextUtils, getContextUtils, type ContextUtils } from '../../src/globalContext';

describe('given Mediator Context Utils', () => {
  describe('given createMediatorContextUtils', () => {
    it('given a mediator fn and context, when createMediatorContextUtils called, then it executes mediator and returns its result, called with id and data', () => {
      const mediator = vi.fn(() => ({ success: true }));
      const context = { getContext: vi.fn(), setContext: vi.fn() };

      const result = createMediatorContextUtils(mediator, { id: 1 }, {}, context);

      expect(result).toEqual({ success: true });
      expect(mediator).toHaveBeenCalledTimes(1);
      expect(mediator).toHaveBeenCalledWith({ id: 1 }, {});
    });

    it('given mediator that calls getContextUtils inside, when createMediator..., then inside mediator getContext returns the provided value', () => {
      const context: ContextUtils = {
        getContext: vi.fn(() => 'dark') as ContextUtils['getContext'],
        setContext: vi.fn(),
      };

      const mediator = vi.fn(() => {
        const utils = getContextUtils();
        const theme = utils.getContext('theme');
        return { theme };
      });

      const result = createMediatorContextUtils(mediator, {}, {}, context);

      expect(result.theme).toBe('dark');
      expect(context.getContext).toHaveBeenCalledWith('theme');
    });

    it('given nested createMediatorContextUtils calls with different contexts, when executed sequentially, then outer and inner get their respective level values (stack restores)', () => {
      let outerValue: any;
      let innerValue: any;

      const outerMediator = vi.fn(() => {
        outerValue = getContextUtils().getContext('level');
        return 'outer';
      });

      const innerMediator = vi.fn(() => {
        innerValue = getContextUtils().getContext('level');
        return 'inner';
      });

      const outerContext: ContextUtils = {
        getContext: vi.fn(() => 'outer-level') as ContextUtils['getContext'],
        setContext: vi.fn(),
      };
      const innerContext: ContextUtils = {
        getContext: vi.fn(() => 'inner-level') as ContextUtils['getContext'],
        setContext: vi.fn(),
      };

      createMediatorContextUtils(outerMediator, {}, {}, outerContext);
      createMediatorContextUtils(innerMediator, {}, {}, innerContext);

      expect(outerValue).toBe('outer-level');
      expect(innerValue).toBe('inner-level');
    });

    it('given a mediator that throws, when createMediator called, then it throws, and subsequent getContextUtils throws the "only be called synchronously" error (cleanup)', () => {
      const mediator = vi.fn(() => {
        throw new Error('Mediator error');
      });

      const context = { getContext: vi.fn(), setContext: vi.fn() };

      expect(() => createMediatorContextUtils(mediator, {}, {}, context)).toThrow('Mediator error');

      // Should be able to call getContextUtils again without stale state
      expect(() => getContextUtils()).toThrow('can only be called synchronously inside a mediator');
    });
  });

  describe('given getContextUtils', () => {
    it('when getContextUtils called outside any mediator, then it throws the "can only be called synchronously inside a mediator" error', () => {
      expect(() => getContextUtils()).toThrow(
        'getContextUtils() can only be called synchronously inside a mediator function body.'
      );
    });

    it('given a mediator using get/set from getContextUtils, when createMediator..., then the mocks are called with set and get as expected', () => {
      const mockGet = vi.fn();
      const mockSet = vi.fn();

      const context = { getContext: mockGet, setContext: mockSet };

      const mediator = () => {
        const utils = getContextUtils();
        utils.setContext('test', 42);
        return utils.getContext('test');
      };

      createMediatorContextUtils(mediator, {}, {}, context);

      expect(mockSet).toHaveBeenCalledWith('test', 42);
    });
  });
});
