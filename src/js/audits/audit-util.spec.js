/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { expect } from 'chai';
import { stringifyFormElement, stringifyFormElementAsCode } from './audit-util';
import { getTreeNodeWithParents } from '../tree-util';

describe('audit-util', function () {
  describe('stringifyFormElement', function () {
    it('should render empty label', function () {
      const element = getTreeNodeWithParents({ name: 'label' });
      const result = stringifyFormElement(element);
      expect(result).to.equal('<label></label>');
    });

    it('should render label with for attribute', function () {
      const element = getTreeNodeWithParents({
        name: 'label',
        attributes: { for: 'id' },
        children: [{ text: 'hello' }],
      });
      const result = stringifyFormElement(element);
      expect(result).to.equal('<label for="id">hello</label>');
    });

    it('should render input with attributes', function () {
      const element = getTreeNodeWithParents({ name: 'input', attributes: { id: '__id', name: '__name' } });
      const result = stringifyFormElement(element);
      expect(result).to.equal('<input id="__id" name="__name">');
    });

    it('should render button with attributes', function () {
      const element = getTreeNodeWithParents({ name: 'button', attributes: { id: '__id', name: '__name' } });
      const result = stringifyFormElement(element);
      expect(result).to.equal('<button id="__id" name="__name">');
    });

    it('should render button with attributes and text', function () {
      const element = getTreeNodeWithParents({
        name: 'button',
        attributes: { id: '__id', name: '__name' },
        children: [{ text: 'hello' }],
      });
      const result = stringifyFormElement(element);
      expect(result).to.equal('<button id="__id" name="__name">hello</button>');
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
      expect(result).to.equal('<code>&lt;label for="id"&gt;hello&lt;/label&gt;</code>');
    });

    it('should render code with highlighted section in bold', function () {
      const element = getTreeNodeWithParents({
        name: 'label',
        attributes: { for: 'id' },
        children: [{ text: 'hello' }],
      });
      const result = stringifyFormElementAsCode(element, 'for="id"');
      expect(result).to.equal(
        '<code>&lt;label </code><strong><code>for="id"</code></strong><code>&gt;hello&lt;/label&gt;</code>',
      );
    });
  });
});
