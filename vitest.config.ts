/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

const WEB_REGEX = '**/tests/**/*.web.test.{js,ts,jsx,tsx}';
const NODE_REGEX = '**/tests/**/*.node.test.{js,ts,jsx,tsx}';

export default defineConfig({
  test: {
    globals: true,
    includeSource: ['src/**/*.{js,ts,jsx,tsx}'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['node_modules', 'dist', '**/*.d.ts'],
      thresholds: {
        branches: 0,
        functions: 5,
        lines: 5,
        statements: 5,
      },
    },

    // Multiple Projects
    projects: [
      {
        test: {
          name: 'DOM',
          environment: 'jsdom',
          include: [WEB_REGEX],
          setupFiles: [
            // './src/test/setup.ts',        // recommended
            'core-js/stable',
            'vitest-localstorage-mock',
            'fake-indexeddb/auto',
          ],
          server: {
            deps: {
              inline: ['axios'],
            },
          },
        },
      },
      {
        test: {
          name: 'NODE',
          environment: 'node',
          include: [NODE_REGEX],
        },
      },
    ],
  },
});
