/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
const args = process.argv.slice(2);

const URL_EXP = /<p class="url[^"]*">(.+?)<\/p>/;
const RESULT_REGEXP = /<script type="text\/json" name="auditResults">(.+?)<\/script>/;

args.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const urlMatch = URL_EXP.exec(content);
  let url;
  let result;

  if (urlMatch) {
    const resultMatch = RESULT_REGEXP.exec(content);
    if (resultMatch) {
      url = urlMatch[1];
      result = resultMatch[1];

      if (url) {
        const qsIndex = url.indexOf('?');
        if (qsIndex !== -1) {
          url = url.substring(0, qsIndex);
        }
      }

      console.log(`${url}\t${result}`);
    }
  }
});
