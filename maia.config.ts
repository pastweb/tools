export default [
  {
    entry: {
      index: 'src/index.ts',
      'all.scss': 'src/all.scss',
    },
    versionFile: true,
    build: { target: 'lib' },
    output: {
      package: {
        exports: {
          exclude: [
            /createMatchDevice\/util$/,
            /createLangAsyncStore\/.*$/,
            /createViewRouter\/util\/(constants|getLocation|normalizeOptions|normalizePath|normalizeRoute|normalizeRouteParamValue)$/,
            /hashID\/.*/,
            /portals\/(anchorsSetup\/toolsConstructor$|util.*)/,
            /update\/constants/,
            /immutableProperty/,
          ],
        },
      },
    }
  },
  {
    entry: 'src/colorFilter/index.ts',
    build: { target: 'lib' },
    output: {
      dir: 'colorFilter',
      maia: false,
      preserveModules: false,
      package: {
        files: [ '/colorFilter' ],
        exports: {
          merge: {
            './colorFilter': {
              import: './colorFilter/index.mjs',
              require: './colorFilter/index.cjs',
              types: './dist/types/colorFilter/colorFilter.d.ts',
            },
          },
        },
      }
    },
  },
];
