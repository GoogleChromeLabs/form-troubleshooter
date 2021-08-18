#!/usr/bin/env node
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-var-requires */
const yargs = require('yargs/yargs');
const fs = require('fs');
const { hideBin } = require('yargs/helpers');

const { audit } = require('form-troubleshooter');
const { version } = require('./package.json');

const TREE_REGEXP = /<script type="text\/json" name="tree">(.+?)<\/script>/;
const URL_EXP = /<p class="url[^"]*">(.+?)<\/p>/;
const RESULT_REGEXP = /<script type="text\/json" name="auditResults">(.+?)<\/script>/;

function extractAttributesFromHtml(content) {
  const attributes = {
    url: undefined,
    tree: undefined,
    auditResult: undefined,
  };
  const urlMatch = URL_EXP.exec(content);
  const treeMatch = TREE_REGEXP.exec(content);
  const resultMatch = RESULT_REGEXP.exec(content);

  if (urlMatch) {
    let url = urlMatch[1];

    if (url) {
      const qsIndex = url.indexOf('?');
      if (qsIndex !== -1) {
        url = url.substring(0, qsIndex);
      }
    }
    attributes.url = url;
  }

  if (treeMatch) {
    attributes.tree = treeMatch[1];
  }

  if (resultMatch) {
    attributes.auditResult = resultMatch[1];
  }

  return attributes;
}

// eslint-disable-next-line no-unused-expressions
yargs(hideBin(process.argv))
  .version(version)
  .command(
    'rerun',
    'Reruns an audit on a saved HTML file',
    y => {
      return y.positional('saved-html', {
        describe: 'The saved HTML file to rerun audits with',
        array: true,
        demandOption: true,
      });
    },
    args => {
      args._.slice(1).forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const { url, tree } = extractAttributesFromHtml(content);

        if (url && tree) {
          console.log(`${url}\t${JSON.stringify(audit(JSON.parse(tree)))}`);
          return;
        }
        console.error('File does not contain the required tags');
      });
    },
  )
  .command(
    'extract',
    'Extracts audit results from a saved HTML file',
    y => {
      return y.positional('saved-html', {
        describe: 'The saved HTML file to extract audit results from',
        array: true,
        demandOption: true,
      });
    },
    args => {
      args._.slice(1).forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const { url, auditResult } = extractAttributesFromHtml(content);

        if (url && auditResult) {
          console.log(`${url}\t${auditResult}`);
          return;
        }
        console.error('File does not contain the required tags');
      });
    },
  ).argv;
