import { describe, it, expect, vi } from 'vitest';
import { reactive, ref, effect, computed } from '../../src/reactivity';

vi.useFakeTimers();

describe('reactivity', () => {
  describe('reactive', () => {
    it('tracks and triggers updates', () => {
      const state = reactive({ count: 0 });
      let dummy = 0;

      effect(() => {
        dummy = state.count;
      });

      state.count = 5;
      vi.runAllTimers();

      expect(dummy).toBe(5);
    });

    it('deep mode works', () => {
      const state = reactive({ nested: { value: 1 } }, true);
      let dummy = 0;

      effect(() => {
        dummy = state.nested.value;
      });

      state.nested.value = 42;
      vi.runAllTimers();

      expect(dummy).toBe(42);
    });

    it('does not trigger if value stays the same', () => {
      const state = reactive({ x: 1 });
      const spy = vi.fn(() => state.x);

      effect(spy);

      state.x = 1; // same value
      vi.runAllTimers();

      expect(spy).toHaveBeenCalledTimes(1); // only initial run
    });
  });

  describe('ref', () => {
    it('makes primitive reactive', () => {
      const count = ref(0);
      let dummy = 0;

      effect(() => {
        dummy = count.value;
      });

      count.value = 7;
      vi.runAllTimers();

      expect(dummy).toBe(7);
    });

    it('supports deep mode', () => {
      const nested = ref({ a: 1 }, true);
      let dummy = 0;

      effect(() => {
        dummy = nested.value.a;
      });

      nested.value.a = 10;
      vi.runAllTimers();

      expect(dummy).toBe(10);
    });
  });

  describe('computed', () => {
    it('caches until dependency changes', () => {
      const state = reactive({ a: 1, b: 2 });
      const getter = vi.fn(() => state.a + state.b);

      const sum = computed(getter);

        // first access → compute
      expect(sum.value).toBe(3);
      expect(getter).toHaveBeenCalledTimes(1);

      // second access → cached
      expect(sum.value).toBe(3);
      expect(getter).toHaveBeenCalledTimes(1);

      // update dependency
      state.a = 10;
      vi.runAllTimers();

      expect(sum.value).toBe(12);
      expect(getter).toHaveBeenCalledTimes(2);
    });

    it('works with no dependencies', () => {
      const getter = vi.fn(() => 123);
      const c = computed(getter);

      expect(c.value).toBe(123);
      expect(getter).toHaveBeenCalledTimes(1);

      // cached result
      expect(c.value).toBe(123);
      expect(getter).toHaveBeenCalledTimes(1);
    });
  });

  describe('effect', () => {
    it('respects debounce option', () => {
      const state = reactive({ num: 0 });
      const spy = vi.fn();

      effect(spy);

      state.num++;
      state.num++;
      state.num++;
      vi.advanceTimersByTime(8);
      expect(spy).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('runs effect immediately when no deps are passed', () => {
      const state = reactive({ count: 0 });
      let dummy = 0;

      effect(() => {
        dummy = state.count;
      });

      expect(dummy).toBe(0);

      state.count = 10;
      vi.advanceTimersByTime(20);

      expect(dummy).toBe(10);
    });

    it('tracks a single dependency', () => {
      const state = reactive({ count: 0 });
      let dummy: number | null = null;

      effect((n, o) => { dummy = n; },
        () => state.count,
      );

      state.count = 7;
      vi.runAllTimers();

      expect(dummy).toBe(7);
    });

    it('tracks multiple dependencies from different objects', () => {
      const a = reactive({ x: 1 });
      const b = reactive({ y: 2 });
      let newVals: any[] = [];
      let oldVals: any[] = [];

      effect((n, o) => {
          newVals = n;
          oldVals = o;
        },
        [() => a.x, () => b.y]
      );

      a.x = 10;
      vi.advanceTimersByTime(20);

      expect(newVals).toEqual([10, 2]);
      expect(oldVals).toEqual([1, 2]);

      b.y = 20;
      vi.advanceTimersByTime(20);

      expect(newVals).toEqual([10, 20]);
      expect(oldVals).toEqual([10, 2]);
    });

    it('handles multiple independent effects without interference', () => {
      const state = reactive({ a: 1, b: 2 });
      let dummyA = 0;
      let dummyB = 0;

      effect(
        (n) => { dummyA = n; },
        () => state.a
      );

      effect(
        (n) => { dummyB = n; },
        () => state.b
      );

      state.a = 5;
      vi.advanceTimersByTime(20);

      expect(dummyA).toBe(5);
      expect(dummyB).toBe(0);

      state.b = 7;
      vi.advanceTimersByTime(20);

      expect(dummyA).toBe(5);
      expect(dummyB).toBe(7);
    });

    it('supports immediate option', () => {
      const state = reactive({ count: 3 });
      let dummy: number | null = null;

      effect(
        (n) => { dummy = n; },
        () => state.count,
        true
      );

      vi.advanceTimersByTime(20);
      expect(dummy).toBe(3);

      state.count = 9;
      vi.advanceTimersByTime(20);

      expect(dummy).toBe(9);
    });

    it('works with refs in dependency array', () => {
      const val = ref(0);
      let dummy = 0;

      effect(
        (n) => { dummy = n; },
        val
      );

      val.value = 100;
      vi.advanceTimersByTime(20);

      expect(dummy).toBe(100);
    });

    it('supports mixed sources (ref and function)', () => {
      const count = ref(1);
      const state = reactive({ name: 'Alice' });
      let newVals: any[] = [];
      let oldVals: any[] = [];

      effect(
        (n, o) => {
          newVals = n;
          oldVals = o;
        },
        [count, () => state.name],
        true
      );

      expect(newVals).toEqual([1, 'Alice']);
      expect(oldVals).toEqual([1, 'Alice']);

      count.value = 2;
      vi.advanceTimersByTime(20);
      expect(newVals).toEqual([2, 'Alice']);
      expect(oldVals).toEqual([1, 'Alice']);

      state.name = 'Bob';
      vi.advanceTimersByTime(20);
      expect(newVals).toEqual([2, 'Bob']);
      expect(oldVals).toEqual([2, 'Alice']);
    });

    it('works with any reactive object property', () => {
      const state = reactive({ a: 0, b: 1, c: 2 });
      const spy = vi.fn();

      effect(spy, state);

      state.a = 100;
      vi.advanceTimersByTime(20);

      expect(spy).toHaveBeenCalledWith({ a: 100, b: 1, c: 2 }, { a: 0, b: 1, c: 2 });

      state.b = 200;
      vi.advanceTimersByTime(20);

      expect(spy).toHaveBeenCalledWith({ a: 100, b: 200, c: 2 }, { a: 100, b: 1, c: 2 });

      state.c = 300;
      vi.advanceTimersByTime(20);

      expect(spy).toHaveBeenCalledWith({ a: 100, b: 200, c: 300 }, { a: 100, b: 200, c: 2  });
    });
  });
});
