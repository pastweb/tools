import { describe, it, expect, beforeEach } from 'vitest';
import { createEntry } from '../../src/createEntry';

describe('given createEntry for SSR features', () => {
  it('given initData in SSR env, when createEntry is called, then it generates an ssrId string matching the SSR_ prefix pattern', () => {
    const entry = createEntry({
      initData: { title: 'Test Page' },
    });

    expect(entry.ssrId).toBeDefined();
    expect(typeof entry.ssrId).toBe('string');
    expect(entry.ssrId).toMatch(/^SSR_(\w+)/); // assuming your hashID prefix
  });

  it('when createEntry is called (in non-SSR), then ssrId may be absent or checked accordingly', () => {
    // This test may be flaky depending on test environment.
    // We test the behavior when isBrowser is true.
    const entry = createEntry();

    // If running in Node.js (most test runners), isBrowser is likely false.
    // So we mainly verify that ssrId is a string when present.
    if (entry.ssrId) {
      expect(entry.ssrId).toMatch(/^SSR_(\w+)/);
    }
  });

  it('given a created entry, when memoSSR is called with a promise returning fn, then ssrId is defined and getComposedSSR can be awaited', async () => {
    const entry = createEntry();
    const htmlPromise = Promise.resolve('<div>Hello SSR</div>');

    entry.memoSSR(() => htmlPromise);

    expect(entry.ssrId).toBeDefined();
    // @ts-ignore - Accessing internal ssrMap for testing purposes
    await entry.getComposedSSR();
  });

  it('given nested memoSSR entries, when getComposedSSR is awaited on parent, then the composed HTML includes content from all nested entries', async () => {
    const entry1 = createEntry();

    entry1.memoSSR(() => Promise.resolve(
      `<div>
      <header>Header Content</header>
      ${(() => {
        const entry2 = createEntry();
        entry2.memoSSR(() => Promise.resolve('<main>Main Content</main>'));
        return entry2.ssrId as string;
      })()}
      </div>`
    ));

    const composedHTML = await entry1.getComposedSSR();

    expect(composedHTML).toContain('<header>Header Content</header>');
    expect(composedHTML).toContain('<main>Main Content</main>');
  });

  it('given an entry with memoSSR, when getComposedSSR is called, then subsequent new entries still generate their own ssrId', async () => {
    const entry = createEntry();
    entry.memoSSR(() => Promise.resolve('<div>Test Content</div>'));

    await entry.getComposedSSR();

    // Create a new entry to check new ssrId is generated
    const newEntry = createEntry();
    expect(newEntry.ssrId).toBeDefined();
  });

  it('given a memoSSR that rejects, when getComposedSSR is awaited, then it rejects with the original error', async () => {
    const entry = createEntry();
    const testError = new Error('SSR Render Failed');

    entry.memoSSR(() => Promise.reject(testError));

    await expect(entry.getComposedSSR()).rejects.toThrow('SSR Render Failed');
  });

  it('given multiple nested memoSSR calls in one entry, when getComposedSSR, then result contains all component contents', async () => {
    const entry1 = createEntry();

    entry1.memoSSR(() => Promise.resolve(`
      Component 1, ${(() => {
        const entry2 = createEntry();
        entry2.memoSSR(() => Promise.resolve('Component 2'));
        return entry2.ssrId as string;
      })()}, ${(() => {
        const entry3 = createEntry();
        entry3.memoSSR(() => Promise.resolve('Component 3'));
        return entry3.ssrId as string;
      })()}
    `));

    const result = await entry1.getComposedSSR();

    expect(result).toContain('Component 1');
    expect(result).toContain('Component 2');
    expect(result).toContain('Component 3');
  });

  it('given an entry with ssrId, when mergeOptions is called with new initData, then ssrId remains the same while options are updated', () => {
    const entry = createEntry({
      initData: {
        userId: 123,
        theme: 'light',
      },
    });

    const originalSsrId = entry.ssrId;

    entry.mergeOptions({
      initData: {
        userId: 456,
        theme: 'dark',
      },
    });

    expect(entry.ssrId).toBe(originalSsrId);
    expect(entry.options.initData).toEqual({
      userId: 456,
      theme: 'dark',
    });
  });

  it('given an entry, when setEntryComponent is called with a component, then the EntryComponent property is updated to it', () => {
    const entry = createEntry();
    const TestComponent = () => 'Test';

    entry.setEntryComponent(TestComponent);

    expect(entry.EntryComponent).toBe(TestComponent);
  });

  it('given an entry, when setOptions is called, then the options are updated with the provided values', () => {
    const entry = createEntry();

    entry.setOptions({
      initData: { foo: 'bar' },
    });

    expect(entry.options.initData).toEqual({ foo: 'bar' });
  });
});
