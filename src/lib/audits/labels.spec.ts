/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { getTextContent, getTreeNodeWithParents } from '../tree-util';
import {
  hasEmptyLabel,
  hasInput,
  hasLabelWithUniqueForAttribute,
  hasLabelWithValidElements,
  hasUniqueLabels,
} from './labels';

describe('labels', function () {
  describe('hasEmptyLabel', function () {
    it('should not return audit error when label has text', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', children: [{ text: 'hello' }] }] });
      const result = hasEmptyLabel(tree);
      expect(result).toBeUndefined();
    });

    it('should not return audit error when label has children with text', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', children: [{ name: 'span', children: [{ text: 'hello' }] }] }],
      });
      const result = hasEmptyLabel(tree);
      expect(result).toBeUndefined();
    });

    it('should return audit error when label has no text', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label' }] });
      const result = hasEmptyLabel(tree);

      expect(result!.items[0].name).toEqual('label');
      expect(result!.score).toBe(0);
    });

    it('should return audit error when label has no children with text', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', children: [{ name: 'span' }] }] });
      const result = hasEmptyLabel(tree);

      expect(result!.items[0].name).toEqual('label');
      expect(result!.score).toBe(0);
    });
  });

  describe('hasUniqueLabels', function () {
    it('should not return audit error when with single label', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', children: [{ text: 'hello' }] }] });
      const result = hasUniqueLabels(tree);
      expect(result).toBeUndefined();
    });

    it('should not return audit error when with multiple empty labels', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label' }, { name: 'label' }] });
      const result = hasUniqueLabels(tree);
      expect(result).toBeUndefined();
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

      expect(result!.items[0].name).toEqual('label');
      expect(getTextContent(result!.items[0])).toEqual('hello');
      expect(getTextContent(result!.items[0].context.duplicates[0])).toEqual('hello');
      expect(result!.score).toBe(0);
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
      expect(result).toBeUndefined();
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
      expect(result).toBeUndefined();
    });
  });

  describe('hasLabelWithValidElements', function () {
    it('should not return audit error with text label', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'label', children: [{ text: 'hello' }] }] });
      const result = hasLabelWithValidElements(tree);
      expect(result).toBeUndefined();
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

      expect(result!.items[0].name).toEqual('label');
      expect(getTextContent(result!.items[0])).toEqual('hello anchor heading');
      expect(result!.items[0].context.fields[0].name).toEqual('a');
      expect(result!.items[0].context.fields[1].name).toEqual('h1');
      expect(result!.score).toBe(0);
    });
  });

  describe('hasLabelWithUniqueForAttribute', function () {
    it('should not return audit error for single label with for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', attributes: { for: 'input' }, children: [{ text: 'hello' }] }],
      });
      const result = hasLabelWithUniqueForAttribute(tree);
      expect(result).toBeUndefined();
    });

    it('should return audit error for multiple labels with the same for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { for: 'input' }, children: [{ text: 'hello' }] },
          { name: 'label', attributes: { for: 'input' }, children: [{ text: 'world' }] },
        ],
      });
      const result = hasLabelWithUniqueForAttribute(tree);

      expect(result!.items[0].name).toEqual('label');
      expect(result!.items[0].context.duplicates).toHaveLength(1);
      expect(result!.score).toBe(0);
    });

    it('should not return audit error for mutliple labels with different for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { for: 'input1' }, children: [{ text: 'hello' }] },
          { name: 'label', attributes: { for: 'input2' }, children: [{ text: 'world' }] },
        ],
      });
      const result = hasLabelWithUniqueForAttribute(tree);
      expect(result).toBeUndefined();
    });
  });

  describe('hasInput', function () {
    it('should not return audit error for label with matching input (for)', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { for: 'input1' }, children: [{ text: 'hello' }] },
          { name: 'input', attributes: { id: 'input1' } },
        ],
      });
      const result = hasInput(tree);
      expect(result).toBeUndefined();
    });

    it('should not return audit error for label with matching input (for) with id', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { id: 'label', for: 'input1' }, children: [{ text: 'hello' }] },
          { name: 'input', attributes: { id: 'input1' } },
        ],
      });
      const result = hasInput(tree);
      expect(result).toBeUndefined();
    });

    it('should not return audit error for label with matching input (child)', function () {
      const tree = getTreeNodeWithParents({
        children: [
          {
            name: 'label',
            attributes: {},
            children: [{ text: 'hello' }, { name: 'input', attributes: { id: 'input1' } }],
          },
        ],
      });
      const result = hasInput(tree);
      expect(result).toBeUndefined();
    });

    it('should not return audit error for label with matching input (aria-labelledby)', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { id: 'label1' }, children: [{ text: 'hello' }] },
          { name: 'input', attributes: { 'aria-labelledby': 'label1' } },
        ],
      });
      const result = hasInput(tree);
      expect(result).toBeUndefined();
    });

    it('should return audit error for label without matching input (for)', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { for: 'input1' }, children: [{ text: 'hello' }] },
          { name: 'input', attributes: { id: 'input2' } },
        ],
      });
      const result = hasInput(tree);
      expect(result).not.toBeUndefined();
    });

    it('should return audit error for label without matching input (child)', function () {
      const tree = getTreeNodeWithParents({
        children: [
          {
            name: 'label',
            attributes: {},
            children: [{ text: 'hello' }],
          },
        ],
      });
      const result = hasInput(tree);
      expect(result).not.toBeUndefined();
    });

    it('should return audit error for label without matching input (aria-labelledby)', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { id: 'label1' }, children: [{ text: 'hello' }] },
          { name: 'input', attributes: { 'aria-labelledby': 'label' } },
        ],
      });
      const result = hasInput(tree);
      expect(result).not.toBeUndefined();
    });

    it('should return audit error for label with empty for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', attributes: { id: 'label1', for: '' }, children: [{ text: 'hello' }] }],
      });
      const result = hasInput(tree);
      expect(result).not.toBeUndefined();
    });

    it('should return audit error for label with no for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', attributes: { id: 'label1' }, children: [{ text: 'hello' }] }],
      });
      const result = hasInput(tree);
      expect(result).not.toBeUndefined();
    });
  });
});
