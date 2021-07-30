/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { expect } from 'chai';
import { groupBy } from './array-util';

describe('array-util', function () {
  describe('groupBy', function () {
    it('should group elements using grouping function', function () {
      const result = groupBy(
        [
          { id: '1', value: 'a' },
          { id: '1', value: 'b' },
          { id: '2', value: 'c' },
        ],
        item => item.id,
      );
      expect(result.get('1')).to.eql([
        { id: '1', value: 'a' },
        { id: '1', value: 'b' },
      ]);
      expect(result.get('2')).to.eql([{ id: '2', value: 'c' }]);
    });

    it('should group primitives without grouping function', function () {
      const result = groupBy([1, 1, 1, 2, 3, 3]);
      expect(result.get(1)).to.eql([1, 1, 1]);
      expect(result.get(2)).to.eql([2]);
      expect(result.get(3)).to.eql([3, 3]);
    });
  });
});
