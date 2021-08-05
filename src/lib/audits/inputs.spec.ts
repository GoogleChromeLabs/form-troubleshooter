/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { getTreeNodeWithParents } from '../tree-util';
import { hasValidInputType, inputHasLabel } from './inputs';

describe('inputs', function () {
  describe('hasValidInputType', function () {
    it('should not return audit error when input contains valid type', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { type: 'text' } }] });
      const result = hasValidInputType(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error when input contains invalid type', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { type: 'check' } }] });
      const result = hasValidInputType(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].items[0].context.suggestion).toEqual('checkbox');
      expect(result[0].type).toEqual('error');
    });

    it('should return audit error when input contains invalid type without suggestion', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { type: 'radiobutton' } }] });
      const result = hasValidInputType(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].items[0].context.suggestion).toBeNull();
      expect(result[0].type).toEqual('error');
    });
  });

  describe('inputHasLabel', function () {
    it('should not return audit error when input has a parent label', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', children: [{ text: 'text' }, { name: 'input', attributes: { type: 'text' } }] }],
      });
      const result = inputHasLabel(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when label has matching for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { for: 'input' }, children: [{ text: 'text' }] },
          { name: 'input', attributes: { type: 'text', id: 'input' } },
        ],
      });
      const result = inputHasLabel(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error for button inputs', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { type: 'button', id: 'input' } }],
      });
      const result = inputHasLabel(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error for submit inputs', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { type: 'button', id: 'input' } }],
      });
      const result = inputHasLabel(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error when label does not have for attribute (input)', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', children: [{ text: 'text' }] },
          { name: 'input', attributes: { id: 'input', type: 'text' } },
        ],
      });
      const result = inputHasLabel(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].items[0].context.reasons).toContainEqual({ type: 'id', reference: 'input' });
      expect(result[0].type).toEqual('error');
    });

    it('should return audit error when label does not have for attribute (select)', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', children: [{ text: 'text' }] },
          { name: 'select', attributes: { id: 'select' } },
        ],
      });
      const result = inputHasLabel(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('select');
      expect(result[0].items[0].context.reasons).toContainEqual({ type: 'id', reference: 'select' });
      expect(result[0].type).toEqual('error');
    });

    it('should return audit error when label does not have for attribute (textarea)', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', children: [{ text: 'text' }] },
          { name: 'textarea', attributes: { id: 'textarea' } },
        ],
      });
      const result = inputHasLabel(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('textarea');
      expect(result[0].items[0].context.reasons).toContainEqual({ type: 'id', reference: 'textarea' });
      expect(result[0].type).toEqual('error');
    });

    it('should not return audit error when input has aria-labelledby', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { id: 'label' }, children: [{ text: 'text' }] },
          { name: 'input', attributes: { 'type': 'text', 'aria-labelledby': 'label' } },
        ],
      });
      const result = inputHasLabel(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when input has aria-labelledby with some matching ids', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { id: 'label' }, children: [{ text: 'text' }] },
          { name: 'input', attributes: { 'type': 'text', 'aria-labelledby': 'label other' } },
        ],
      });
      const result = inputHasLabel(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error when input has aria-labelledby without matching id', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { id: 'label' }, children: [{ text: 'text' }] },
          { name: 'input', attributes: { 'type': 'text', 'aria-labelledby': 'labels' } },
        ],
      });
      const result = inputHasLabel(tree);
      expect(result.length).toEqual(1);
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].items[0].context.reasons).toContainEqual({ type: 'aria-labelledby', reference: 'labels' });
      expect(result[0].type).toEqual('error');
    });
  });
});
