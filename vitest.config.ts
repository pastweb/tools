/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

const WEB_TESTS = [
  '**/tests/createApiAgent/createQueryCache.web.test.{js,ts,jsx,tsx}',
  '**/tests/createApiAgent/selectOption.web.test.{js,ts,jsx,tsx}',
  '**/tests/createApiAgent/toon.web.test.{js,ts,jsx,tsx}',
  '**/tests/createApiAgent/useInfiniteQuery.web.test.{js,ts,jsx,tsx}',
  '**/tests/createApiAgent/useMutationRetry.web.test.{js,ts,jsx,tsx}',
  '**/tests/createApiAgent/useQueries.web.test.{js,ts,jsx,tsx}',
  '**/tests/createApiAgent/useQueryRetry.web.test.{js,ts,jsx,tsx}',
  '**/tests/createViewRouter/createViewRouter.web.test.{js,ts,jsx,tsx}',
  '**/tests/createViewRouter/useLocation.web.test.{js,ts,jsx,tsx}',
  '**/tests/createViewRouter/useNavigate.web.test.{js,ts,jsx,tsx}',
  '**/tests/createViewRouter/usePaths.web.test.{js,ts,jsx,tsx}',
  '**/tests/createViewRouter/useRoute.web.test.{js,ts,jsx,tsx}',
  '**/tests/createViewRouter/useRouter.web.test.{js,ts,jsx,tsx}',
  '**/tests/createViewRouter/useRouterLink.web.test.{js,ts,jsx,tsx}',
  '**/tests/createViewRouter/useSearchParams.web.test.{js,ts,jsx,tsx}',
];
const NODE_TESTS = [
  '**/tests/createApiAgent/createQueryCache.node.test.{js,ts,jsx,tsx}',
  '**/tests/createApiAgent/ssrOption.node.test.{js,ts,jsx,tsx}',
  '**/tests/createQueryCache/sliceDehydratedState.node.test.{js,ts,jsx,tsx}',
  '**/tests/createQueryCache/ssrDehydratedState.node.test.{js,ts,jsx,tsx}',
  '**/tests/createViewRouter/createViewRouter.node.test.{js,ts,jsx,tsx}',
  '**/tests/runSSRCycle/runSSRCycle.node.test.{js,ts,jsx,tsx}',
  '**/tests/ssrTracker/ssrTracker.node.test.{js,ts,jsx,tsx}',
  '**/tests/stringToMs/stringToMs.node.test.{js,ts,jsx,tsx}',
];

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
          include: WEB_TESTS,
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
          include: NODE_TESTS,
        },
      },
    ],
  },
});
