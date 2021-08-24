/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { stringifyFormElement } from './audit-util';
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

    it('should render input with empty attribute without ""', function () {
      const element = getTreeNodeWithParents({
        name: 'input',
        attributes: { id: '__id', name: '' },
      });
      const result = stringifyFormElement(element);
      expect(result).toEqual('<input id="__id" name>');
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

    it('should render button with additional visible attributes', function () {
      const element = getTreeNodeWithParents({ name: 'button', attributes: { id: '__id', additional: 'true' } });
      const result = stringifyFormElement(element, ['additional']);
      expect(result).toEqual('<button id="__id" additional="true"></button>');
    });

    it('should render button with additional visible attributes with more attributes', function () {
      const element = getTreeNodeWithParents({
        name: 'button',
        attributes: { id: '__id', additional: 'true', more: 'true' },
      });
      const result = stringifyFormElement(element, ['additional']);
      expect(result).toEqual('<button id="__id" additional="true" ...></button>');
    });
  });
});
