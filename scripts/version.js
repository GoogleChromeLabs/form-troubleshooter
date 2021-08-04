/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { dirname, join, resolve } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let packageFile = '../package.json';

if (process.argv[2]) {
  packageFile = join(process.cwd(), process.argv[2]);
}

const packageInfo = JSON.parse(readFileSync(resolve(__dirname, packageFile), 'utf-8'));

console.log(packageInfo.version);
