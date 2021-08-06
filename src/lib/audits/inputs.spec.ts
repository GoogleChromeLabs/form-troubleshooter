/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { getTreeNodeWithParents } from '../tree-util';
import { hasValidInputType, inputHasLabel } from './inputs';

describe('inputs', function () {
  describe('hasValidInputType', function () {
    it('should not return audit error when input contains valid type', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { type: 'text' } }] });
      const result = hasValidInputType(tree);
      expect(result).toBeUndefined();
    });

    it('should return audit error when input contains invalid type', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { type: 'check' } }] });
      const result = hasValidInputType(tree);

      expect(result!.items[0].name).toEqual('input');
      expect(result!.items[0].context.suggestion).toEqual('checkbox');
    });

    it('should return audit error when input contains invalid type without suggestion', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { type: 'radiobutton' } }] });
      const result = hasValidInputType(tree);

      expect(result!.items[0].name).toEqual('input');
      expect(result!.items[0].context.suggestion).toBeNull();
    });
  });

  describe('inputHasLabel', function () {
    it('should not return audit error when input has a parent label', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'label', children: [{ text: 'text' }, { name: 'input', attributes: { type: 'text' } }] }],
      });
      const result = inputHasLabel(tree);
      expect(result).toBeUndefined();
    });

    it('should not return audit error when label has matching for attribute', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { for: 'input' }, children: [{ text: 'text' }] },
          { name: 'input', attributes: { type: 'text', id: 'input' } },
        ],
      });
      const result = inputHasLabel(tree);
      expect(result).toBeUndefined();
    });

    it('should not return audit error for button inputs', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { type: 'button', id: 'input' } }],
      });
      const result = inputHasLabel(tree);
      expect(result).toBeUndefined();
    });

    it('should not return audit error for submit inputs', function () {
      const tree = getTreeNodeWithParents({
        children: [{ name: 'input', attributes: { type: 'button', id: 'input' } }],
      });
      const result = inputHasLabel(tree);
      expect(result).toBeUndefined();
    });

    it('should return audit error when label does not have for attribute (input)', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', children: [{ text: 'text' }] },
          { name: 'input', attributes: { id: 'input', type: 'text' } },
        ],
      });
      const result = inputHasLabel(tree);

      expect(result!.items[0].name).toEqual('input');
      expect(result!.items[0].context.reasons).toContainEqual({ type: 'id', reference: 'input' });
    });

    it('should return audit error when label does not have for attribute (select)', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', children: [{ text: 'text' }] },
          { name: 'select', attributes: { id: 'select' } },
        ],
      });
      const result = inputHasLabel(tree);

      expect(result!.items[0].name).toEqual('select');
      expect(result!.items[0].context.reasons).toContainEqual({ type: 'id', reference: 'select' });
      expect(result!.score).toBe(0);
    });

    it('should return audit error when label does not have for attribute (textarea)', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', children: [{ text: 'text' }] },
          { name: 'textarea', attributes: { id: 'textarea' } },
        ],
      });
      const result = inputHasLabel(tree);

      expect(result!.items[0].name).toEqual('textarea');
      expect(result!.items[0].context.reasons).toContainEqual({ type: 'id', reference: 'textarea' });
      expect(result!.score).toBe(0);
    });

    it('should not return audit error when input has aria-labelledby', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { id: 'label' }, children: [{ text: 'text' }] },
          { name: 'input', attributes: { 'type': 'text', 'aria-labelledby': 'label' } },
        ],
      });
      const result = inputHasLabel(tree);
      expect(result).toBeUndefined();
    });

    it('should not return audit error when input has aria-labelledby with some matching ids', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { id: 'label' }, children: [{ text: 'text' }] },
          { name: 'input', attributes: { 'type': 'text', 'aria-labelledby': 'label other' } },
        ],
      });
      const result = inputHasLabel(tree);
      expect(result).toBeUndefined();
    });

    it('should return audit error when input has aria-labelledby without matching id', function () {
      const tree = getTreeNodeWithParents({
        children: [
          { name: 'label', attributes: { id: 'label' }, children: [{ text: 'text' }] },
          { name: 'input', attributes: { 'type': 'text', 'aria-labelledby': 'labels' } },
        ],
      });
      const result = inputHasLabel(tree);

      expect(result!.items[0].name).toEqual('input');
      expect(result!.items[0].context.reasons).toContainEqual({ type: 'aria-labelledby', reference: 'labels' });
      expect(result!.score).toBe(0);
    });
  });
});
