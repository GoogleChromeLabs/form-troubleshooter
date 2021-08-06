/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

const path = require('path');
let packageFile = '../package.json';

if (process.argv[2]) {
  packageFile = path.join(process.cwd(), process.argv[2]);
}

const packageInfo = require(packageFile);

console.log(packageInfo.version);
