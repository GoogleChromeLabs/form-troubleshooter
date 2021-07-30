/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { expect } from 'chai';
import { getTreeNodeWithParents } from '../tree-util';
import { wrapInCode } from './audit-util';
import {
  hasAutocompleteAttributes,
  hasAutocompleteOff,
  hasEmptyAutocomplete,
  hasValidAutocomplete,
} from './autocomplete';

describe('autocomplete', function () {
  describe('hasAutocompleteAttributes', function () {
    it('should not return audit error when input has autocomplete', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { name: 'input1', autocomplete: 'cc-name' } }],
      });
      const result = hasAutocompleteAttributes(tree);
      expect(result).to.be.eql([]);
    });

    it('should not return audit error when input does not have name and no autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input' }] });
      const result = hasAutocompleteAttributes(tree);
      expect(result).to.be.eql([]);
    });

    it('should return audit error when input has autocomplete name but no autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { name: 'username' } }] });
      const result = hasAutocompleteAttributes(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<input name="username">'));
      expect(result[0].type).to.equal('warning');
    });
  });

  describe('hasEmptyAutocomplete', function () {
    it('should not return audit error when input has autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'cc-name' } }] });
      const result = hasEmptyAutocomplete(tree);
      expect(result).to.be.eql([]);
    });

    it('should not return audit error when input has invalid autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'stuff' } }] });
      const result = hasEmptyAutocomplete(tree);
      expect(result).to.be.eql([]);
    });

    it('should return audit error when input has empty autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: '' } }] });
      const result = hasEmptyAutocomplete(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<input autocomplete="">'));
      expect(result[0].type).to.equal('error');
    });

    it('should return audit error when input has empty autocomplete (whitespace)', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: ' ' } }] });
      const result = hasEmptyAutocomplete(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<input autocomplete=" ">'));
      expect(result[0].type).to.equal('error');
    });
  });

  describe('hasAutocompleteOff', function () {
    it('should not return audit error when input has autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'cc-name' } }] });
      const result = hasAutocompleteOff(tree);
      expect(result).to.be.eql([]);
    });

    it('should not return audit error when input has invalid autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'stuff' } }] });
      const result = hasAutocompleteOff(tree);
      expect(result).to.be.eql([]);
    });

    it('should not return audit error when input has empty autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: '' } }] });
      const result = hasAutocompleteOff(tree);
      expect(result).to.be.eql([]);
    });

    it('should return audit error when input has autocomplete off', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'off' } }] });
      const result = hasAutocompleteOff(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<input autocomplete="off">'));
      expect(result[0].type).to.equal('warning');
    });
  });

  describe('hasValidAutocomplete', function () {
    it('should not return audit error when input has valid autocomplete value', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'cc-name' } }] });
      const result = hasValidAutocomplete(tree);
      expect(result).to.be.eql([]);
    });

    it('should return audit error when input has invalid autocomplete value', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'stuff' } }] });
      const result = hasValidAutocomplete(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<input autocomplete="stuff">'));
      expect(result[0].type).to.equal('error');
    });

    it('should return audit error when input has invalid autocomplete value (multiple tokens)', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { autocomplete: 'stuff username' } }],
      });
      const result = hasValidAutocomplete(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<input autocomplete="stuff username">'));
      expect(result[0].type).to.equal('error');
    });

    it('should not return audit error when input has valid autocomplete value (multiple tokens)', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { autocomplete: 'shipping address-line1' } }],
      });
      const result = hasValidAutocomplete(tree);
      expect(result).to.be.eql([]);
    });

    it('should not return audit error when input has valid autocomplete value (section)', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'section-1' } }] });
      const result = hasValidAutocomplete(tree);
      expect(result).to.be.eql([]);
    });

    it('should not return audit error when input has valid autocomplete value (section address)', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { autocomplete: 'section-1 address-line1' } }],
      });
      const result = hasValidAutocomplete(tree);
      expect(result).to.be.eql([]);
    });

    it('should not return audit error when input has valid autocomplete value (whitespace)', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: ' ' } }] });
      const result = hasValidAutocomplete(tree);
      expect(result).to.be.eql([]);
    });

    it('should not return audit error when input has empty autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: '' } }] });
      const result = hasValidAutocomplete(tree);
      expect(result).to.be.eql([]);
    });

    it('should not return audit error when input has autocomplete off', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'off' } }] });
      const result = hasValidAutocomplete(tree);
      expect(result).to.be.eql([]);
    });
  });
});
