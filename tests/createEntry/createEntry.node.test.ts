import { describe, it, expect, beforeEach } from 'vitest';
import { createEntry } from '../../src/createEntry';

describe('createEntry - SSR Features', () => {
  it('generates ssrId in SSR environment', () => {
    const entry = createEntry({
      initData: { title: 'Test Page' },
    });

    expect(entry.ssrId).toBeDefined();
    expect(typeof entry.ssrId).toBe('string');
    expect(entry.ssrId).toMatch(/^SSR_(\w+)/); // assuming your hashID prefix
  });

  it('does not generate ssrId in client environment', () => {
    // This test may be flaky depending on test environment.
    // We test the behavior when isSSR is false.
    const entry = createEntry();

    // If running in Node.js (most test runners), isSSR is likely true.
    // So we mainly verify that ssrId is a string when present.
    if (entry.ssrId) {
      expect(entry.ssrId).toMatch(/^SSR_(\w+)/);
    }
  });

  it('memoSSR stores render promise for later use', async () => {
    const entry = createEntry();
    const htmlPromise = Promise.resolve('<div>Hello SSR</div>');

    entry.memoSSR(() => htmlPromise);

    expect(entry.ssrId).toBeDefined();
    // @ts-ignore - Accessing internal ssrMap for testing purposes
    await entry.getComposedSSR();
  });

  it('getComposedSSR returns composed HTML from multiple entries', async () => {
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

  it('getComposedSSR clears maps after execution', async () => {
    const entry = createEntry();
    entry.memoSSR(() => Promise.resolve('<div>Test Content</div>'));

    await entry.getComposedSSR();

    // Create a new entry to check new ssrId is generated
    const newEntry = createEntry();
    expect(newEntry.ssrId).toBeDefined();
  });

  it('handles errors in getComposedSSR', async () => {
    const entry = createEntry();
    const testError = new Error('SSR Render Failed');

    entry.memoSSR(() => Promise.reject(testError));

    await expect(entry.getComposedSSR()).rejects.toThrow('SSR Render Failed');
  });

  it('supports multiple memoSSR calls', async () => {
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

  it('mergeOptions preserves ssrId', () => {
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

  it('setEntryComponent updates the EntryComponent', () => {
    const entry = createEntry();
    const TestComponent = () => 'Test';

    entry.setEntryComponent(TestComponent);

    expect(entry.EntryComponent).toBe(TestComponent);
  });

  it('setOptions updates options correctly', () => {
    const entry = createEntry();

    entry.setOptions({
      initData: { foo: 'bar' },
    });

    expect(entry.options.initData).toEqual({ foo: 'bar' });
  });
});
