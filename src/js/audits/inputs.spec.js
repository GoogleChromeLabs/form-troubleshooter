/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { expect } from 'chai';
import { wrapInCode } from './audit-util';
import { getTreeNodeWithParents } from '../tree-util';
import { hasValidInputType } from './inputs';

describe('inputs', function () {
  describe('hasValidInputType', function () {
    it('should not return audit error when input contains valid type', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { type: 'text' } }] });
      const result = hasValidInputType(tree);
      expect(result).to.be.empty;
    });

    it('should return audit error when input contains invalid type', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { type: 'check' } }] });
      const result = hasValidInputType(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<input type="check">'));
      expect(result[0].details).to.contain('did you mean <code>checkbox</code>');
      expect(result[0].type).to.equal('error');
    });

    it('should return audit error when input contains invalid type without suggestion', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { type: 'radiobutton' } }] });
      const result = hasValidInputType(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<input type="radiobutton">'));
      expect(result[0].details).not.to.contain('did you mean');
      expect(result[0].type).to.equal('error');
    });
  });
});
