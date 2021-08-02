/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { expect } from 'chai';
import { wrapInCode } from './audit-util';
import { getTreeNodeWithParents } from '../tree-util';
import { hasValidInputType, inputHasLabel } from './inputs';

describe('inputs', function () {
  describe('hasValidInputType', function () {
    it('should not return audit error when input contains valid type', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { type: 'text' } }] });
      const result = hasValidInputType(tree);
      expect(result).to.be.eql([]);
    });

    it('should return audit error when input contains invalid type', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { type: 'check' } }] });
      const result = hasValidInputType(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<input type="check">'));
      expect(result[0].details).to.contain('Did you mean <code>checkbox</code>');
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

  describe('inputHasLabel', function () {
    it('should not return audit error when input has a parent label', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', children: [{ text: 'text' }, { name: 'input', attributes: { type: 'text' } }] }],
      });
      const result = inputHasLabel(tree);
      expect(result).to.be.eql([]);
    });

    it('should not return audit error when input label identified by for', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { for: 'input' }, children: [{ text: 'text' }] },
          { name: 'input', attributes: { type: 'text', id: 'input' } },
        ],
      });
      const result = inputHasLabel(tree);
      expect(result).to.be.eql([]);
    });

    it('should return audit error when input contains invalid type without suggestion', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', children: [{ text: 'text' }] },
          { name: 'input', attributes: { id: 'input', type: 'text' } },
        ],
      });
      const result = inputHasLabel(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<input id="input" type="text">'));
      expect(result[0].type).to.equal('error');
    });
  });

  it('should return audit error when select contains invalid type without suggestion', function () {
    const tree = getTreeNodeWithParents({
      children: [
        { name: 'label', children: [{ text: 'text' }] },
        { name: 'select', attributes: { id: 'select' } },
      ],
    });
    const result = inputHasLabel(tree);
    expect(result.length).to.equal(1);
    expect(result[0].details).to.contain(wrapInCode('<select id="select">'));
    expect(result[0].type).to.equal('error');
  });

  it('should return audit error when textarea contains invalid type without suggestion', function () {
    const tree = getTreeNodeWithParents({
      children: [
        { name: 'label', children: [{ text: 'text' }] },
        { name: 'textarea', attributes: { id: 'textarea' } },
      ],
    });
    const result = inputHasLabel(tree);
    expect(result.length).to.equal(1);
    expect(result[0].details).to.contain(wrapInCode('<textarea id="textarea">'));
    expect(result[0].type).to.equal('error');
  });
});
