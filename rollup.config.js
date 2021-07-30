import * as fs from 'fs-extra';
import * as path from 'path';
import resolve from 'rollup-plugin-node-resolve';

const buildFolder = 'build/';

export default [
  {
    input: 'src/js/popup.js',
    output: {
      file: `${buildFolder}js/popup.js`,
    },
    plugins: [
      resolve({
        browser: true,
      }),
      copy('src/popup.html', `${buildFolder}popup.html`),
      copy('src/css', `${buildFolder}css`),
      copy('src/images', `${buildFolder}images`),
      mergeJson(['src/manifest.json', 'manifest.key.json'], `${buildFolder}manifest.json`),
    ],
  },
  {
    input: 'src/background.js',
    output: {
      file: `${buildFolder}background.js`,
    },
  },
  {
    input: 'src/js/content-script.js',
    output: {
      file: `${buildFolder}js/content-script.js`,
    },
  },
  {
    input: 'src/js/options.js',
    output: {
      file: `${buildFolder}js/options.js`,
    },
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
