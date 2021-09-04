/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import * as fs from 'fs-extra';
import * as path from 'path';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

const buildFolder = 'build/';
const distFolder = 'dist/';

const envManifest = process.argv.includes('--configDev') ? 'manifest.dev.json' : 'manifest.prod.json';

export default [
  {
    input: 'src/background.ts',
    output: {
      file: `${buildFolder}background.js`,
    },
    plugins: [
      typescript(),
      replace({
        'preventAssignment': true,
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      nodeResolve(),
    ],
  },
  {
    input: 'src/lib/content-script.ts',
    output: {
      file: `${buildFolder}lib/content-script.js`,
    },
    plugins: [
      typescript(),
      copy('src/css', `${buildFolder}css`),
      copy('src/images', `${buildFolder}images`),
      mergeJson(['src/manifest.json', 'manifest.version.json', envManifest], `${buildFolder}manifest.json`),
    ],
  },
  {
    input: 'src/module.ts',
    output: {
      file: `${distFolder}index.js`,
      format: 'cjs',
    },
    plugins: [typescript({ target: 'es6', lib: ['es5', 'es6', 'ESNext', 'dom'] }), nodeResolve()],
  },
];

function copy(source, destination) {
  return {
    name: 'copy',
    writeBundle(output) {
      fs.copySync(path.resolve(__dirname, source), path.resolve(__dirname, destination));
    },
  };
}

function mergeJson(jsonFiles, target) {
  return {
    name: 'mergeJson',
    writeBundle(output) {
      const [baseFile, ...otherJsonFiles] = jsonFiles
        .map(file => path.resolve(__dirname, file))
        .filter(file => fs.existsSync(file))
        .map(file => JSON.parse(fs.readFileSync(file, 'utf-8')));

      fs.writeFileSync(target, JSON.stringify(Object.assign({}, baseFile, ...otherJsonFiles), null, '  '));
    },
  };
}
