#!/usr/bin/env node
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-var-requires */
const puppeteer = require('puppeteer');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { audit, getPath, stringifyFormElement } = require('form-troubleshooter');
const { getDocumentTree } = require('./puppeteer-dom');
const { version } = require('./package.json');

const argv = yargs(hideBin(process.argv))
  .version(version)
  .usage('Performs a Form troubleshooter audit on the list of provided urls.\n\nUsage: $0 [options] <...urls>')
  .positional('urls', {
    describe: 'list of urls to audit',
    type: 'string',
    array: true,
    demandOption: true,
  })
  .option('format', {
    alias: 'f',
    describe: 'Output format',
    choices: ['json', 'tsv'],
    default: 'json',
  })
  .option('headers', {
    describe: 'Include TSV headers in output',
    boolean: true,
    default: true,
  })
  .option('tree', {
    describe: 'Include DOM tree in the output',
    boolean: true,
    default: false,
  }).argv;

function toJson(content) {
  return JSON.stringify({ ...content, result: prepareResultsForSerialization(content.result) });
}

const TSV_HEADINGS = ['url', 'total_score', 'type', 'audit', 'audit_score', 'item', 'item_path'];
if (argv.tree) {
  TSV_HEADINGS.push('tree');
}

function toTsv(content) {
  const { url, result, tree } = content;
  const issues = [
    ...result.errors.map(r => ({ ...r, type: 'error' })),
    ...result.warnings.map(r => ({ ...r, type: 'warning' })),
  ];
  return (
    issues
      .flatMap(issue =>
        issue.items.map(item => ({
          url,
          total_score: result.score,
          type: issue.type,
          audit: issue.auditType,
          audit_score: issue.score,
          item: stringifyFormElement(item),
          item_path: getPath(item),
        })),
      )
      // only inject tree into the first row
      .map((issue, index) => (index === 0 ? { ...issue, tree: JSON.stringify(tree) } : issue))
      .map(row => TSV_HEADINGS.map(heading => row[heading]).join('\t'))
      .join('\n')
  );
}

function writeOutput(url, result, tree, error) {
  if (argv.format === 'json') {
    const content = {
      url,
      result,
    };

    if (error) {
      content.error = {
        message: error.message,
        details: error.toString(),
      };
    }

    if (argv.tree) {
      content.tree = tree;
    }

    console.log(toJson(content));
  } else if (argv.format === 'tsv') {
    console.log(toTsv({ url, result, tree }));
  }
}

function prepareResultsForSerialization(auditResult) {
  const IGNORED_FIELDS = ['children', 'parent'];
  return JSON.parse(
    JSON.stringify(auditResult, (key, value) => {
      return IGNORED_FIELDS.includes(key)
        ? undefined
        : typeof value === 'object'
        ? Object.keys(value || {}).length
          ? value
          : undefined
        : value;
    }),
  );
}

(async () => {
  const browser = await puppeteer.launch({
    // headless: false,
  });

  try {
    // render TSV headers if required
    if (argv.format === 'tsv' && argv.headers) {
      console.log(TSV_HEADINGS.join('\t'));
    }

    await Promise.all(
      argv._.map(async url => {
        let page;
        let tree;
        let result;
        let error;

        try {
          page = await browser.newPage();
          await page.goto(url);

          tree = await page.evaluate(getDocumentTree);
          result = audit(tree);
        } catch (err) {
          error = err;
          console.error(`Error auditing ${url}`, error);
        } finally {
          if (page) {
            await page.close();
          }
        }

        writeOutput(url, result, tree, error);
      }),
    );
  } finally {
    await browser.close();
  }
})();
