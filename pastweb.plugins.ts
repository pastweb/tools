import { builder } from '../cli-builder/src';

export default builder([
  {
    entry: {
      index: 'src/index.ts',
      '_index.scss': 'src/_index.scss',
    },
    build: {
      versionFile: true,
    },
    output: {
      package: {
        exports: {
          exclude: [
            /.*_index\.scss/,
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
    output: {
      dir: 'colorFilter',
      types: 'types/colorFilter',
      package: {
        peerDependenciesMeta: {
          sass: { optional: true },
        },
      },
    },
  },
  {
    entry: 'src/createLangAsyncStore/index.ts',
    output: {
      dir: 'createLangAsyncStore',
      package: {
        peerDependenciesMeta: {
          i18next: { optional: true },
        },
      },
    },
  },
]);
