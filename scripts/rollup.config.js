// rollup.config.js
import fs from 'fs';
import path from 'path';
import svg from 'rollup-plugin-vue-inline-svg';
import vue from 'rollup-plugin-vue';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import minimist from 'minimist';

// Get browserslist config and remove ie from es build targets
const esbrowserslist = fs.readFileSync('./.browserslistrc')
  .toString()
  .split('\n')
  .filter((entry) => entry && entry.substring(0, 2) !== 'ie');

// Extract babel preset-env config, to combine with esbrowserslist
const babelPresetEnvConfig = require('../babel.config')
  .presets.filter((entry) => entry[0] === '@babel/preset-env')[0][1];

const argv = minimist(process.argv.slice(2));

const projectRoot = path.resolve(__dirname, '..');

const baseConfig = {
  input: 'src/vue/entry.js',
  plugins: {
    preVue: [
      alias({
        entries: [
          {
            find: '@',
            replacement: `${path.resolve(projectRoot, 'src')}`,
          },
        ],
      }),
    ],
    replace: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    svg: {
      svgoConfig: {
        plugins: [
          {cleanupAttrs: false},
          {mergeStyles: false},
          {inlineStyles: false},
          {removeDoctype: false},
          {removeXMLProcInst: false},
          {removeComments: false},
          {removeMetadata: false},
          {removeTitle: false},
          {removeDesc: false},
          {removeUselessDefs: false},
          {removeXMLNS: false},
          {removeEditorsNSData: false},
          {removeEmptyAttrs: false},
          {removeHiddenElems: false},
          {removeEmptyText: false},
          {removeEmptyContainers: false},
          {removeViewBox: false},
          {cleanupEnableBackground: false},
          {minifyStyles: false},
          {convertStyleToAttrs: false},
          {convertColors: false},
          {convertPathData: false},
          {convertTransform: false},
          {removeUnknownsAndDefaults: false},
          {removeNonInheritableGroupAttrs: false},
          {removeUselessStrokeAndFill: false},
          {removeUnusedNS: false},
          {prefixIds: false},
          {cleanupIDs: false},
          {cleanupNumericValues: false},
          {cleanupListOfValues: false},
          {moveElemsAttrsToGroup: false},
          {moveGroupAttrsToElems: false},
          {collapseGroups: false},
          {removeRasterImages: false},
          {mergePaths: false},
          {convertShapeToPath: false},
          {convertEllipseToCircle: false},
          {sortAttrs: false},
          {sortDefsChildren: false},
          {removeDimensions: false},
          {removeAttrs: false},
          {removeAttributesBySelector: false},
          {removeElementsByAttr: false},
          {addClassesToSVGElement: false},
          {addAttributesToSVGElement: false},
          {removeOffCanvasPaths: false},
          {removeStyleElement: false},
          {removeScriptElement: false},
          {reusePaths: false},
        ]
      }
    },
    vue: {
      css: true,
      template: {
        isProduction: true,
      },
    },
    postVue: [
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      }),
      commonjs(),
    ],
    babel: {
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      babelHelpers: 'bundled',
    },
  },
};

// ESM/UMD/IIFE shared settings: externals
// Refer to https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency
const external = [
  // list external dependencies, exactly the way it is written in the import statement.
  // eg. 'jquery'
  'vue',
];

// UMD/IIFE shared settings: output.globals
// Refer to https://rollupjs.org/guide/en#output-globals for details22222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
const globals = {
  // Provide global variable names to replace your external imports
  // eg. jquery: '$'
  vue: 'Vue',
};

// Customize configs for individual targets
const buildFormats = [];
if (!argv.format || argv.format === 'es') {
  const esConfig = {
    ...baseConfig,
    input: 'src/vue/entry.esm.js',
    external,
    output: {
      file: 'dist/vue/panfilov.digital.esm.js',
      format: 'esm',
      exports: 'named',
    },
    plugins: [
      replace(baseConfig.plugins.replace),
      ...baseConfig.plugins.preVue,
      svg(baseConfig.plugins.svg),
      vue(baseConfig.plugins.vue),
      ...baseConfig.plugins.postVue,
      babel({
        ...baseConfig.plugins.babel,
        presets: [
          [
            '@babel/preset-env',
            {
              ...babelPresetEnvConfig,
              targets: esbrowserslist,
            },
          ],
        ],
      }),
    ],
  };
  buildFormats.push(esConfig);
}

if (!argv.format || argv.format === 'cjs') {
  const umdConfig = {
    ...baseConfig,
    external,
    output: {
      compact: true,
      file: 'dist/vue/panfilov.digital.ssr.js',
      format: 'cjs',
      name: 'Panfilov.digital',
      exports: 'auto',
      globals,
    },
    plugins: [
      replace(baseConfig.plugins.replace),
      ...baseConfig.plugins.preVue,
      svg(baseConfig.plugins.svg),
      vue({
        ...baseConfig.plugins.vue,
        template: {
          ...baseConfig.plugins.vue.template,
          optimizeSSR: true,
        },
      }),
      ...baseConfig.plugins.postVue,
      babel(baseConfig.plugins.babel),
    ],
  };
  buildFormats.push(umdConfig);
}

if (!argv.format || argv.format === 'iife') {
  const unpkgConfig = {
    ...baseConfig,
    external,
    output: {
      compact: true,
      file: 'dist/vue/panfilov.digital.min.js',
      format: 'iife',
      name: 'Panfilov.digital',
      exports: 'auto',
      globals,
    },
    plugins: [
      replace(baseConfig.plugins.replace),
      ...baseConfig.plugins.preVue,
      svg(baseConfig.plugins.svg),
      vue(baseConfig.plugins.vue),
      ...baseConfig.plugins.postVue,
      babel(baseConfig.plugins.babel),
      terser({
        output: {
          ecma: 5,
        },
      }),
    ],
  };
  buildFormats.push(unpkgConfig);
}

// Export config
export default buildFormats;
