/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { getTextContent, getTreeNodeWithParents } from '../tree-util';
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
      expect(result).toEqual([]);
    });

    it('should not return audit error when label has children with text', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', children: [{ name: 'span', children: [{ text: 'hello' }] }] }],
      });
      const result = hasEmptyLabel(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error when label has no text', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label' }] });
      const result = hasEmptyLabel(tree);
      expect(result.length).toEqual(1);
      expect(result[0].details).toContain(wrapInCode('<label></label>'));
      expect(result[0].items[0].name).toEqual('label');
      expect(result[0].learnMore).toContain(result[0].references[0].title);
      expect(result[0].learnMore).toContain(result[0].references[0].url);
      expect(result[0].type).toEqual('error');
    });

    it('should return audit error when label has no children with text', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', children: [{ name: 'span' }] }] });
      const result = hasEmptyLabel(tree);
      expect(result.length).toEqual(1);
      expect(result[0].details).toContain(wrapInCode('<label></label>'));
      expect(result[0].items[0].name).toEqual('label');
      expect(result[0].learnMore).toContain(result[0].references[0].title);
      expect(result[0].learnMore).toContain(result[0].references[0].url);
      expect(result[0].type).toEqual('error');
    });
  });

  describe('hasUniqueLabels', function () {
    it('should not return audit error when with single label', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', children: [{ text: 'hello' }] }] });
      const result = hasUniqueLabels(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when with multiple empty labels', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label' }, { name: 'label' }] });
      const result = hasUniqueLabels(tree);
      expect(result).toEqual([]);
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
      expect(result.length).toEqual(1);
      expect(result[0].details).toContain(`${wrapInCode('<label>hello</label>')}`);
      expect(result[0].items[0].name).toEqual('label');
      expect(getTextContent(result[0].items[0])).toEqual('hello');
      expect(result[0].items[0].context.text).toEqual('hello');
      expect(getTextContent(result[0].items[0].context.duplicates[0])).toEqual('hello');
      expect(result[0].learnMore).toContain(result[0].references[0].title);
      expect(result[0].learnMore).toContain(result[0].references[0].url);
      expect(result[0].type).toEqual('warning');
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
      expect(result).toEqual([]);
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
      expect(result).toEqual([]);
    });
  });

  describe('hasLabelWithValidElements', function () {
    it('should not return audit error with text label', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', children: [{ text: 'hello' }] }] });
      const result = hasLabelWithValidElements(tree);
      expect(result).toEqual([]);
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
      expect(result.length).toEqual(1);
      expect(result[0].details).toContain(wrapInCode('<label>hello anchor heading</label>'));
      expect(result[0].details).toContain(wrapInCode('a'));
      expect(result[0].details).toContain(wrapInCode('h1'));
      expect(result[0].items[0].name).toEqual('label');
      expect(getTextContent(result[0].items[0])).toEqual('hello anchor heading');
      expect(result[0].items[0].context.fields[0].name).toEqual('a');
      expect(result[0].items[0].context.fields[1].name).toEqual('h1');
      expect(result[0].learnMore).toContain(result[0].references[0].title);
      expect(result[0].learnMore).toContain(result[0].references[0].url);
      expect(result[0].type).toEqual('warning');
    });
  });

  describe('hasLabelWithForAttribute', function () {
    it('should not return audit error for label with for attribute', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', attributes: { for: 'input' } }] });
      const result = hasLabelWithForAttribute(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when label has input element', function () {
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
      expect(result).toEqual([]);
    });

    it('should not return audit error when label has input with aria-labelledby', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { id: 'label' }, children: [{ text: 'username' }] },
          { name: 'input', attributes: { 'type': 'text', 'aria-labelledby': 'label' } },
        ],
      });
      const result = hasLabelWithForAttribute(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error when label has no matching input with aria-labelledby', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { id: 'label1' }, children: [{ text: 'username' }] },
          { name: 'input', attributes: { 'type': 'text', 'aria-labelledby': 'label2' } },
        ],
      });
      const result = hasLabelWithForAttribute(tree);
      expect(result.length).toEqual(1);
      expect(result[0].details).toContain(wrapInCode('<label id="label1">username</label>'));
      expect(result[0].items[0].name).toEqual('label');
      expect(getTextContent(result[0].items[0])).toEqual('username');
      expect(result[0].learnMore).toContain(result[0].references[0].title);
      expect(result[0].learnMore).toContain(result[0].references[0].url);
      expect(result[0].type).toEqual('error');
    });

    it('should return audit error for label without for attribute', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', children: [{ text: 'hello' }] }] });
      const result = hasLabelWithForAttribute(tree);
      expect(result.length).toEqual(1);
      expect(result[0].details).toContain(wrapInCode('<label>hello</label>'));
      expect(result[0].items[0].name).toEqual('label');
      expect(getTextContent(result[0].items[0])).toEqual('hello');
      expect(result[0].learnMore).toContain(result[0].references[0].title);
      expect(result[0].learnMore).toContain(result[0].references[0].url);
      expect(result[0].type).toEqual('error');
    });
  });

  describe('hasLabelWithEmptyForAttribute', function () {
    it('should not return audit error for label with for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', attributes: { for: 'input' }, children: [{ text: 'hello' }] }],
      });
      const result = hasLabelWithEmptyForAttribute(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error for label with empty for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', attributes: { for: '' }, children: [{ text: 'hello' }] }],
      });
      const result = hasLabelWithEmptyForAttribute(tree);
      expect(result.length).toEqual(1);
      expect(result[0].details).toContain(wrapInCode('<label for="">hello</label>'));
      expect(result[0].items[0].name).toEqual('label');
      expect(getTextContent(result[0].items[0])).toEqual('hello');
      expect(result[0].learnMore).toContain(result[0].references[0].title);
      expect(result[0].learnMore).toContain(result[0].references[0].url);
      expect(result[0].type).toEqual('error');
    });

    it('should return audit error for label with empty for attribute (whitespace)', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', attributes: { for: ' ' }, children: [{ text: 'hello' }] }],
      });
      const result = hasLabelWithEmptyForAttribute(tree);
      expect(result.length).toEqual(1);
      expect(result[0].details).toContain(wrapInCode('<label for=" ">hello</label>'));
      expect(result[0].items[0].name).toEqual('label');
      expect(result[0].items[0].attributes.for).toEqual(' ');
      expect(getTextContent(result[0].items[0])).toEqual('hello');
      expect(result[0].learnMore).toContain(result[0].references[0].title);
      expect(result[0].learnMore).toContain(result[0].references[0].url);
      expect(result[0].type).toEqual('error');
    });
  });

  describe('hasLabelWithUniqueForAttribute', function () {
    it('should not return audit error for single label with for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', attributes: { for: 'input' }, children: [{ text: 'hello' }] }],
      });
      const result = hasLabelWithUniqueForAttribute(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error for multiple labels with the same for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { for: 'input' }, children: [{ text: 'hello' }] },
          { name: 'label', attributes: { for: 'input' }, children: [{ text: 'world' }] },
        ],
      });
      const result = hasLabelWithUniqueForAttribute(tree);
      expect(result.length).toEqual(1);
      expect(result[0].details).toContain(`${wrapInCode('<label for="input">hello</label>')}`);
      expect(result[0].details).toContain(`${wrapInCode('<label for="input">world</label>')}`);
      expect(result[0].items[0].name).toEqual('label');
      expect(result[0].items[0].context.duplicates).toHaveLength(1);
      expect(result[0].learnMore).toContain(result[0].references[0].title);
      expect(result[0].learnMore).toContain(result[0].references[0].url);
      expect(result[0].type).toEqual('error');
    });

    it('should not return audit error for mutliple labels with different for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { for: 'input1' }, children: [{ text: 'hello' }] },
          { name: 'label', attributes: { for: 'input2' }, children: [{ text: 'world' }] },
        ],
      });
      const result = hasLabelWithUniqueForAttribute(tree);
      expect(result).toEqual([]);
    });
  });

  describe('hasMatchingForLabel', function () {
    it('should not return audit error for label without for attribute', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', children: [{ text: 'hello' }] }] });
      const result = hasMatchingForLabel(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error for multiple labels without matching inputs', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { for: 'input1' }, children: [{ text: 'hello' }] },
          { name: 'label', attributes: { for: 'input2' }, children: [{ text: 'world' }] },
        ],
      });
      const result = hasMatchingForLabel(tree);
      expect(result.length).toEqual(1);
      expect(result[0].details).toContain(wrapInCode('<label for="input1">hello</label>'));
      expect(result[0].details).toContain(wrapInCode('<label for="input2">world</label>'));
      expect(result[0].items[0].attributes.for).toEqual('input1');
      expect(result[0].items[1].attributes.for).toEqual('input2');
      expect(result[0].learnMore).toContain(result[0].references[0].title);
      expect(result[0].learnMore).toContain(result[0].references[0].url);
      expect(result[0].type).toEqual('error');
    });

    it('should not return audit error for label with matching input', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { for: 'input1' }, children: [{ text: 'hello' }] },
          { name: 'input', attributes: { id: 'input1' } },
        ],
      });
      const result = hasMatchingForLabel(tree);
      expect(result).toEqual([]);
    });
  });
});
