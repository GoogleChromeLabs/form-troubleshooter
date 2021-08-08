/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { condenseWhitespace, pluralize, truncate } from './string-util';

describe('pluralize', function () {
  describe('single word', function () {
    it('should pluralize 0 count', function () {
      const result = pluralize(0, 'form');
      expect(result).toEqual('forms');
    });

    it('should not pluralize 1 count', function () {
      const result = pluralize(1, 'form');
      expect(result).toEqual('form');
    });

    it('should pluralize 2 count', function () {
      const result = pluralize(2, 'form');
      expect(result).toEqual('forms');
    });
  });

  describe('multiple words', function () {
    it('should pluralize 0 count', function () {
      const result = pluralize(0, 'octopus', 'octopuses');
      expect(result).toEqual('octopuses');
    });

    it('should not pluralize 1 count', function () {
      const result = pluralize(1, 'octopus', 'octopuses');
      expect(result).toEqual('octopus');
    });

    it('should pluralize 2 count', function () {
      const result = pluralize(2, 'octopus', 'octopuses');
      expect(result).toEqual('octopuses');
    });
  });

  describe('multiple words (same word)', function () {
    it('should pluralize 0 count', function () {
      const result = pluralize(0, 'sheep', 'sheep');
      expect(result).toEqual('sheep');
    });

    it('should not pluralize 1 count', function () {
      const result = pluralize(1, 'sheep', 'sheep');
      expect(result).toEqual('sheep');
    });

    it('should pluralize 2 count', function () {
      const result = pluralize(2, 'sheep', 'sheep');
      expect(result).toEqual('sheep');
    });
  });

  describe('multiple words with zero', function () {
    it('should pluralize 0 count', function () {
      const result = pluralize(0, 'octopus', 'octopuses', 'noctopi');
      expect(result).toEqual('noctopi');
    });

    it('should not pluralize 1 count', function () {
      const result = pluralize(1, 'octopus', 'octopuses', 'noctopi');
      expect(result).toEqual('octopus');
    });

    it('should pluralize 2 count', function () {
      const result = pluralize(2, 'octopus', 'octopuses', 'noctopi');
      expect(result).toEqual('octopuses');
    });
  });
});

describe('truncate', function () {
  it('should not truncate a string that is shorter than the target length', function () {
    const result = truncate('short', 20);
    expect(result).toEqual('short');
  });

  it('should truncate a string that is longer than the target length, inserting default indicator', function () {
    const result = truncate('short sentence', 10);
    expect(result).toEqual('short s...');
  });

  it('should truncate a string that is longer than the target length, trimming out whitespace and inserting default indicator', function () {
    const result = truncate('short sentence', 9);
    expect(result).toEqual('short...');
  });

  it('should truncate a string that is longer than the target length, inserting custom indicator', function () {
    const result = truncate('short sentence', 10, '_');
    expect(result).toEqual('short sen_');
  });

  it('should truncate a string that is longer than the target length, inserting empty indicator', function () {
    const result = truncate('short sentence', 10, '');
    expect(result).toEqual('short sent');
  });

  it('should return the indicator where the indicator is longer than the target length', function () {
    const result = truncate('short sentence', 5, '...more...');
    expect(result).toEqual('...more...');
  });

  it('should truncate a string leaving leading whitespace as is', function () {
    const result = truncate('  short sentence', 9);
    expect(result).toEqual('  shor...');
  });

  it('should return null when input is null', function () {
    const result = truncate(null, 10);
    expect(result).toEqual(null);
  });
});

describe('condenseWhitespace', function () {
  it('should condense leading and trailing whitespace (default)', function () {
    const result = condenseWhitespace('\n\nhello  world\n\n');
    expect(result).toEqual(' hello  world ');
  });

  it('should condense leading and trailing whitespace', function () {
    const result = condenseWhitespace('\n\nhello  world\n\n', 'leading-trailing');
    expect(result).toEqual(' hello  world ');
  });

  it('should condense all whitespace', function () {
    const result = condenseWhitespace('\n\nhello\n \nworld\n\n', 'all');
    expect(result).toEqual(' hello world ');
  });
});
