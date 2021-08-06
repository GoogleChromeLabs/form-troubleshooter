/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { pluralize } from './string-util';

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
