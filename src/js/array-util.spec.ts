/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

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
      expect(result.get('1')).toEqual([
        { id: '1', value: 'a' },
        { id: '1', value: 'b' },
      ]);
      expect(result.get('2')).toEqual([{ id: '2', value: 'c' }]);
    });

    it('should group primitives without grouping function', function () {
      const result = groupBy([1, 1, 1, 2, 3, 3]);
      expect(result.get(1)).toEqual([1, 1, 1]);
      expect(result.get(2)).toEqual([2]);
      expect(result.get(3)).toEqual([3, 3]);
    });
  });
});
