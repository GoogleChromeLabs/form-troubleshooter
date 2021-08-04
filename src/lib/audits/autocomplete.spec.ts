/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { getTreeNodeWithParents } from '../tree-util';
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
      expect(result).toEqual([]);
    });

    it('should not return audit error when input does not have name and no autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input' }] });
      const result = hasAutocompleteAttributes(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error when input has name but no autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { name: 'username' } }] });
      const result = hasAutocompleteAttributes(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].type).toEqual('warning');
    });
  });

  describe('hasEmptyAutocomplete', function () {
    it('should not return audit error when input has autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'cc-name' } }] });
      const result = hasEmptyAutocomplete(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when input has invalid autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'stuff' } }] });
      const result = hasEmptyAutocomplete(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error when input has empty autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: '' } }] });
      const result = hasEmptyAutocomplete(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].items[0].attributes.autocomplete).toEqual('');
      expect(result[0].type).toEqual('error');
    });

    it('should return audit error when input has empty autocomplete (whitespace)', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: ' ' } }] });
      const result = hasEmptyAutocomplete(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].items[0].attributes.autocomplete).toEqual(' ');
      expect(result[0].type).toEqual('error');
    });
  });

  describe('hasAutocompleteOff', function () {
    it('should not return audit error when input has autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'cc-name' } }] });
      const result = hasAutocompleteOff(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when input has invalid autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'stuff' } }] });
      const result = hasAutocompleteOff(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when input has empty autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: '' } }] });
      const result = hasAutocompleteOff(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error when input has autocomplete off', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'off' } }] });
      const result = hasAutocompleteOff(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].items[0].attributes.autocomplete).toEqual('off');
      expect(result[0].type).toEqual('warning');
    });
  });

  describe('hasValidAutocomplete', function () {
    it('should not return audit error when input has valid autocomplete value', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'cc-name' } }] });
      const result = hasValidAutocomplete(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error when input has invalid autocomplete value', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'stuff' } }] });
      const result = hasValidAutocomplete(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].items[0].attributes.autocomplete).toEqual('stuff');
      expect(result[0].type).toEqual('error');
    });

    it('should return audit error when input has invalid autocomplete value (multiple tokens)', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { autocomplete: 'stuff username' } }],
      });
      const result = hasValidAutocomplete(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].items[0].attributes.autocomplete).toEqual('stuff username');
      expect(result[0].type).toEqual('error');
    });

    it('should not return audit error when input has valid autocomplete value (multiple tokens)', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { autocomplete: 'shipping address-line1' } }],
      });
      const result = hasValidAutocomplete(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when input has valid autocomplete value (section)', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'section-1' } }] });
      const result = hasValidAutocomplete(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when input has valid autocomplete value (section address)', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { autocomplete: 'section-1 address-line1' } }],
      });
      const result = hasValidAutocomplete(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when input has valid autocomplete value (whitespace)', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: ' ' } }] });
      const result = hasValidAutocomplete(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when input has empty autocomplete', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: '' } }] });
      const result = hasValidAutocomplete(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when input has autocomplete off', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { autocomplete: 'off' } }] });
      const result = hasValidAutocomplete(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error when input has invalid autocomplete value with suggestion', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { autocomplete: 'section-1 usrname' } }],
      });
      const result = hasValidAutocomplete(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].items[0].attributes.autocomplete).toEqual('section-1 usrname');
      expect(result[0].items[0].context.suggestion).toEqual('username');
      expect(result[0].type).toEqual('error');
    });

    it('should return audit error when input has invalid autocomplete value (suggest alias for delivery)', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { autocomplete: 'delivery address-line1' } }],
      });
      const result = hasValidAutocomplete(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].items[0].attributes.autocomplete).toEqual('delivery address-line1');
      expect(result[0].items[0].context.suggestion).toEqual('shipping');
      expect(result[0].type).toEqual('error');
    });

    it('should return audit error when input has invalid autocomplete value (suggest alias for zip)', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { autocomplete: 'zip' } }],
      });
      const result = hasValidAutocomplete(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].items[0].attributes.autocomplete).toEqual('zip');
      expect(result[0].items[0].context.suggestion).toEqual('postal-code');
      expect(result[0].type).toEqual('error');
    });

    it('should return audit error when input has invalid autocomplete value (suggest alias for zipcode)', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { autocomplete: 'zipcode' } }],
      });
      const result = hasValidAutocomplete(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].items[0].attributes.autocomplete).toEqual('zipcode');
      expect(result[0].items[0].context.suggestion).toEqual('postal-code');
      expect(result[0].type).toEqual('error');
    });

    it('should return audit error when input has invalid autocomplete value (suggest alias for state)', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { autocomplete: 'state' } }],
      });
      const result = hasValidAutocomplete(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].items[0].attributes.autocomplete).toEqual('state');
      expect(result[0].items[0].context.suggestion).toEqual('address-level1');
      expect(result[0].type).toEqual('error');
    });

    it('should return audit error when input has invalid autocomplete value without suggestion', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { autocomplete: 'section-1 sjdjdasd' } }],
      });
      const result = hasValidAutocomplete(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].items[0].attributes.autocomplete).toEqual('section-1 sjdjdasd');
      expect(result[0].items[0].context.suggestion).toBeNull();
      expect(result[0].type).toEqual('error');
    });
  });
});
