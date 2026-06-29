import { describe, it, expect, vi } from 'vitest';
import { reactive, ref, effect, computed } from '../../src/reactivity';

vi.useFakeTimers();

describe('reactivity', () => {
  describe('reactive', () => {
    it('given a reactive object, when a tracked property is mutated, then effects re-run after debounce', () => {
      const state = reactive({ count: 0 });
      let dummy = 0;

      effect(() => {
        dummy = state.count;
      });

      state.count = 5;
      vi.runAllTimers();

      expect(dummy).toBe(5);
    });

    it('given deep mode enabled, when a nested property is mutated, then effects tracking it are triggered', () => {
      const state = reactive({ nested: { value: 1 } }, true);
      let dummy = 0;

      effect(() => {
        dummy = state.nested.value;
      });

      state.nested.value = 42;
      vi.runAllTimers();

      expect(dummy).toBe(42);
    });

    it('given a reactive property, when it is set to the same value, then effects are not re-triggered', () => {
      const state = reactive({ x: 1 });
      const spy = vi.fn(() => state.x);

      effect(spy);

      state.x = 1; // same value
      vi.runAllTimers();

      expect(spy).toHaveBeenCalledTimes(1); // only initial run
    });
  });

  describe('ref', () => {
    it('given a primitive wrapped in ref(), when its .value is mutated, then effects tracking it re-run', () => {
      const count = ref(0);
      let dummy = 0;

      effect(() => {
        dummy = count.value;
      });

      count.value = 7;
      vi.runAllTimers();

      expect(dummy).toBe(7);
    });

    it('given a ref with deep mode, when a nested property mutates, then effects are triggered', () => {
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
    it('given a computed with dependencies, when dependencies change, then it recomputes only when accessed and caches otherwise', () => {
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

    it('given a computed with no dependencies, when accessed multiple times, then the getter runs only once and result is cached', () => {
      const getter = vi.fn(() => 123);
      const c = computed(getter);

      expect(c.value).toBe(123);
      expect(getter).toHaveBeenCalledTimes(1);

      // cached result
      expect(c.value).toBe(123);
      expect(getter).toHaveBeenCalledTimes(1);
    });

    it('given an async computed getter, when dependencies change, then it returns stale value while pending and updates after resolution (stale-while-revalidate)', async () => {
      const state = reactive({ a: 1 });
      const asyncSum = computed(async () => {
        // IMPORTANT: read all reactive dependencies in the synchronous prefix
        // so they are collected under the computed's runner. Work after await
        // can use the captured values.
        const a = state.a;
        await Promise.resolve(); // simulate async work (e.g. fetch)
        return a + 2;
      });

      // first access starts the computation but (for async) returns previous value (undefined)
      expect(asyncSum.value).toBe(undefined);

      // Flush microtasks (the inner await + the .then attached in ensureComputed).
      // A single await can be racy with chained microtasks; two is reliable here.
      await Promise.resolve();
      await Promise.resolve();

      expect(asyncSum.value).toBe(3);

      // change a captured dep - this will have registered the computed's runner,
      // so it will mark dirty on change.
      state.a = 10;

      // re-access: sees stale while the new async work runs
      expect(asyncSum.value).toBe(3);

      await Promise.resolve();
      await Promise.resolve();
      expect(asyncSum.value).toBe(12);
    });

    it('given a computed returning an object (proxy form), when effects read its properties directly, then they track and update on dep changes', () => {
      const state = reactive({ count: 0 });
      // computed returns an object → we get a proxy with direct prop access + tracking
      const viewModel = computed(() => ({
        doubled: state.count * 2,
        label: 'computed-object',
      }));

      let lastDoubled: number | null = null;
      let lastLabel: string | null = null;

      effect(() => {
        // Depending on properties of the proxy (not .value)
        lastDoubled = viewModel.doubled;
        lastLabel = viewModel.label;
      });

      expect(lastDoubled).toBe(0);
      expect(lastLabel).toBe('computed-object');

      // Change a dependency inside the computed getter
      state.count = 5;
      vi.advanceTimersByTime(20);

      expect(lastDoubled).toBe(10);
      expect(lastLabel).toBe('computed-object');

      // Another change
      state.count = 7;
      vi.advanceTimersByTime(20);

      expect(lastDoubled).toBe(14);
    });
  });

  describe('effect', () => {
    it('given an effect with default debounce, when multiple sync mutations occur, then the effect runs only once after the debounce window', () => {
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

    it('given an effect with no explicit source, when created, then it runs immediately and tracks accessed reactives', () => {
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

    it('given an effect with a single source, when the source changes, then the runner receives new and old values', () => {
      const state = reactive({ count: 0 });
      let dummy: number | null = null;

      effect((n, o) => { dummy = n; },
        () => state.count,
      );

      state.count = 7;
      vi.runAllTimers();

      expect(dummy).toBe(7);
    });

    it('given an effect with an array source from multiple objects, when any dep changes, then the effect receives the full snapshot of new/old values', () => {
      const a = reactive({ x: 1 });
      const b = reactive({ y: 2 });
      let newVals: any[] = [];
      let oldVals: any[] = [];

      // Using the supported form: a function that returns the array of (accessed) dependencies
      effect((n, o) => {
          newVals = n;
          oldVals = o;
        },
        () => [a.x, b.y]
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

    it('given multiple effects with separate sources, when one source changes, then only the corresponding effect runs', () => {
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

    it('given an effect with immediate=true, when created, then it runs synchronously with current value before any changes', () => {
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

    it('given an async effect callback, when a dep changes, then the sync prefix collects deps and the async continuation runs later with captured values', async () => {
      const state = reactive({ count: 0 });
      const calls: number[] = [];

      effect(async () => {
        // Read reactives in the sync prefix so dependencies are collected.
        // The await + side effect happens in the continuation (fire-and-forget).
        const current = state.count;
        await Promise.resolve();
        calls.push(current);
      });

      // initial run
      await Promise.resolve();
      expect(calls).toEqual([0]);

      state.count = 5;
      vi.advanceTimersByTime(20); // let debounce flush the runner
      await Promise.resolve(); // let the async continuation run
      expect(calls).toEqual([0, 5]);

      state.count = 10;
      vi.advanceTimersByTime(20);
      await Promise.resolve();
      expect(calls).toEqual([0, 5, 10]);
    });

    it('given an effect whose source is a ref, when the ref value changes, then the runner is invoked with the new value', () => {
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

    it('given an effect with mixed sources (ref + getter fn), when any source updates, then the effect receives the array of current values', () => {
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

    it('given an effect whose source is a function returning an array, when deps change, then the runner gets the evaluated array values', () => {
      const a = reactive({ x: 1 });
      const b = ref(2);
      let newVals: any[] = [];
      let oldVals: any[] = [];

      effect(
        (n, o) => {
          newVals = n;
          oldVals = o;
        },
        () => [a.x, b.value]
      );

      a.x = 10;
      vi.advanceTimersByTime(20);

      expect(newVals).toEqual([10, 2]);
      expect(oldVals).toEqual([1, 2]);

      b.value = 20;
      vi.advanceTimersByTime(20);

      expect(newVals).toEqual([10, 20]);
      expect(oldVals).toEqual([10, 2]);
    });

    it('given an effect whose source is a reactive object, when any of its properties change, then the runner receives the full new and old state objects', () => {
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
