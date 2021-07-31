/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { expect } from 'chai';
import { getTreeNodeWithParents } from '../tree-util';
import { wrapInCode } from './audit-util';
import {
  hasEmptyLabel,
  hasLabelWithEmptyForAttribute,
  hasLabelWithForAttribute,
  hasLabelWithUniqueForAttribute,
  hasLabelWithValidElements,
  hasMatchingForLabel,
  hasUniqueLabels,
} from './labels';

describe('labels', function () {
  describe('hasEmptyLabel', function () {
    it('should not return audit error when label has text', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', children: [{ text: 'hello' }] }] });
      const result = hasEmptyLabel(tree);
      expect(result).to.be.eql([]);
    });

    it('should not return audit error when label has children with text', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', children: [{ name: 'span', children: [{ text: 'hello' }] }] }],
      });
      const result = hasEmptyLabel(tree);
      expect(result).to.be.eql([]);
    });

    it('should return audit error when label has no text', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label' }] });
      const result = hasEmptyLabel(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<label></label>'));
      expect(result[0].type).to.equal('error');
    });

    it('should return audit error when label has no children with text', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', children: [{ name: 'span' }] }] });
      const result = hasEmptyLabel(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<label></label>'));
      expect(result[0].type).to.equal('error');
    });
  });

  describe('hasUniqueLabels', function () {
    it('should not return audit error when with single label', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', children: [{ text: 'hello' }] }] });
      const result = hasUniqueLabels(tree);
      expect(result).to.be.eql([]);
    });

    it('should not return audit error when with multiple empty labels', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label' }, { name: 'label' }] });
      const result = hasUniqueLabels(tree);
      expect(result).to.be.eql([]);
    });

    it('should return audit error when with duplicate labels', function () {
      const tree = getTreeNodeWithParents({
        children: [
          {
            name: 'label',
            children: [{ text: 'hello' }],
          },
          {
            name: 'label',
            children: [{ text: 'hello' }],
          },
        ],
      });
      const result = hasUniqueLabels(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(
        `${wrapInCode('<label>hello</label>')}, ${wrapInCode('<label>hello</label>')}`,
      );
      expect(result[0].type).to.equal('warning');
    });

    it('should not return audit error when with multiple unique labels', function () {
      const tree = getTreeNodeWithParents({
        children: [
          {
            name: 'label',
            children: [{ text: 'hello' }],
          },
          {
            name: 'label',
            children: [{ text: 'world' }],
          },
        ],
      });
      const result = hasUniqueLabels(tree);
      expect(result).to.be.eql([]);
    });

    it('should not return audit error when with multiple labels in different forms', function () {
      const tree = getTreeNodeWithParents({
        children: [
          {
            name: 'form',
            children: [
              {
                name: 'label',
                children: [{ text: 'hello' }],
              },
            ],
          },
          {
            name: 'form',
            children: [
              {
                name: 'label',
                children: [{ text: 'hello' }],
              },
            ],
          },
        ],
      });
      const result = hasUniqueLabels(tree);
      expect(result).to.be.eql([]);
    });
  });

  describe('hasLabelWithValidElements', function () {
    it('should not return audit error with text label', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', children: [{ text: 'hello' }] }] });
      const result = hasLabelWithValidElements(tree);
      expect(result).to.be.eql([]);
    });

    it('should return audit error when label contains anchor tag', function () {
      const tree = getTreeNodeWithParents({
        children: [
          {
            name: 'label',
            children: [
              {
                name: 'span',
                children: [{ text: 'hello' }],
              },
              {
                name: 'a',
                children: [{ text: 'anchor' }],
              },
              {
                name: 'h1',
                children: [{ text: 'heading' }],
              },
            ],
          },
        ],
      });
      const result = hasLabelWithValidElements(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<label>hello anchor heading</label>'));
      expect(result[0].details).to.contain(`${wrapInCode('a')}, ${wrapInCode('h1')}`);
      expect(result[0].type).to.equal('warning');
    });
  });

  describe('hasLabelWithForAttribute', function () {
    it('should not return audit error for label with for attribute', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', attributes: { for: 'input' } }] });
      const result = hasLabelWithForAttribute(tree);
      expect(result).to.be.eql([]);
    });

    it('should not return audit error when label input element', function () {
      const tree = getTreeNodeWithParents({
        children: [
          {
            name: 'label',
            children: [
              {
                text: 'username',
                children: [{ name: 'input', attributes: { type: 'text' } }],
              },
            ],
          },
        ],
      });
      const result = hasLabelWithForAttribute(tree);
      expect(result).to.be.eql([]);
    });

    it('should return audit error for label without for attribute', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', children: [{ text: 'hello' }] }] });
      const result = hasLabelWithForAttribute(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<label>hello</label>'));
      expect(result[0].type).to.equal('error');
    });
  });

  describe('hasLabelWithEmptyForAttribute', function () {
    it('should not return audit error for label with for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', attributes: { for: 'input' }, children: [{ text: 'hello' }] }],
      });
      const result = hasLabelWithEmptyForAttribute(tree);
      expect(result).to.be.eql([]);
    });

    it('should return audit error for label with empty for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', attributes: { for: '' }, children: [{ text: 'hello' }] }],
      });
      const result = hasLabelWithEmptyForAttribute(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<label for="">hello</label>'));
      expect(result[0].type).to.equal('error');
    });

    it('should return audit error for label with empty for attribute (whitespace)', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', attributes: { for: ' ' }, children: [{ text: 'hello' }] }],
      });
      const result = hasLabelWithEmptyForAttribute(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<label for=" ">hello</label>'));
      expect(result[0].type).to.equal('error');
    });
  });

  describe('hasLabelWithUniqueForAttribute', function () {
    it('should not return audit error for single label with for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', attributes: { for: 'input' }, children: [{ text: 'hello' }] }],
      });
      const result = hasLabelWithUniqueForAttribute(tree);
      expect(result).to.be.eql([]);
    });

    it('should return audit error for multiple labels with the same for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { for: 'input' }, children: [{ text: 'hello' }] },
          { name: 'label', attributes: { for: 'input' }, children: [{ text: 'world' }] },
        ],
      });
      const result = hasLabelWithUniqueForAttribute(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(`${wrapInCode('<label for="input">hello</label>')}`);
      expect(result[0].details).to.contain(`${wrapInCode('<label for="input">world</label>')}`);
      expect(result[0].type).to.equal('error');
    });

    it('should not return audit error for mutliple labels with different for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { for: 'input1' }, children: [{ text: 'hello' }] },
          { name: 'label', attributes: { for: 'input2' }, children: [{ text: 'world' }] },
        ],
      });
      const result = hasLabelWithUniqueForAttribute(tree);
      expect(result).to.be.eql([]);
    });
  });

  describe('hasMatchingForLabel', function () {
    it('should not return audit error for label without for attribute', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', children: [{ text: 'hello' }] }] });
      const result = hasMatchingForLabel(tree);
      expect(result).to.be.eql([]);
    });

    it('should return audit error for multiple labels without matching inputs', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { for: 'input1' }, children: [{ text: 'hello' }] },
          { name: 'label', attributes: { for: 'input2' }, children: [{ text: 'world' }] },
        ],
      });
      const result = hasMatchingForLabel(tree);
      expect(result.length).to.equal(1);
      expect(result[0].details).to.contain(wrapInCode('<label for="input1">hello</label>'));
      expect(result[0].details).to.contain(wrapInCode('<label for="input2">world</label>'));
      expect(result[0].type).to.equal('error');
    });

    it('should not return audit error for label with matching input', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { for: 'input1' }, children: [{ text: 'hello' }] },
          { name: 'input', attributes: { id: 'input1' } },
        ],
      });
      const result = hasMatchingForLabel(tree);
      expect(result).to.be.eql([]);
    });
  });
});
