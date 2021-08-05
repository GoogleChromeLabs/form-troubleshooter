/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { stringifyFormElement, stringifyFormElementAsCode } from './audit-util';
import { getTreeNodeWithParents } from '../tree-util';

describe('audit-util', function () {
  describe('stringifyFormElement', function () {
    it('should render empty label', function () {
      const element = getTreeNodeWithParents({ name: 'label' });
      const result = stringifyFormElement(element);
      expect(result).toEqual('<label></label>');
    });

    it('should render label with for attribute', function () {
      const element = getTreeNodeWithParents({
        name: 'label',
        attributes: { for: 'id' },
        children: [{ text: 'hello' }],
      });
      const result = stringifyFormElement(element);
      expect(result).toEqual('<label for="id">hello</label>');
    });

    it('should render input with attributes', function () {
      const element = getTreeNodeWithParents({ name: 'input', attributes: { id: '__id', name: '__name' } });
      const result = stringifyFormElement(element);
      expect(result).toEqual('<input id="__id" name="__name">');
    });

    it('should render button with attributes', function () {
      const element = getTreeNodeWithParents({ name: 'button', attributes: { id: '__id', name: '__name' } });
      const result = stringifyFormElement(element);
      expect(result).toEqual('<button id="__id" name="__name"></button>');
    });

    it('should render button with additional attributes', function () {
      const element = getTreeNodeWithParents({ name: 'button', attributes: { id: '__id', additional: 'true' } });
      const result = stringifyFormElement(element);
      expect(result).toEqual('<button id="__id" ...></button>');
    });

    it('should render button with text content', function () {
      const element = getTreeNodeWithParents({
        name: 'button',
        attributes: { id: '__id' },
        children: [{ text: 'button' }],
      });
      const result = stringifyFormElement(element);
      expect(result).toEqual('<button id="__id">button</button>');
    });

    it('should render button with attributes and text', function () {
      const element = getTreeNodeWithParents({
        name: 'button',
        attributes: { id: '__id', name: '__name' },
        children: [{ text: 'hello' }],
      });
      const result = stringifyFormElement(element);
      expect(result).toEqual('<button id="__id" name="__name">hello</button>');
    });
  });

  describe('stringifyFormElementAsCode', function () {
    it('should render label with for attribute', function () {
      const element = getTreeNodeWithParents({
        name: 'label',
        attributes: { for: 'id' },
        children: [{ text: 'hello' }],
      });
      const result = stringifyFormElementAsCode(element);
      expect(result).toEqual('<code>&lt;label for="id"&gt;hello&lt;/label&gt;</code>');
    });

    it('should render code with highlighted section in bold', function () {
      const element = getTreeNodeWithParents({
        name: 'label',
        attributes: { for: 'id' },
        children: [{ text: 'hello' }],
      });
      const result = stringifyFormElementAsCode(element, 'for="id"');
      expect(result).toEqual(
        '<code>&lt;label </code><strong><code>for="id"</code></strong><code>&gt;hello&lt;/label&gt;</code>',
      );
    });
  });
});
