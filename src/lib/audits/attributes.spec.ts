/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { getTreeNodeWithParents } from '../tree-util';
import { hasIdOrName, hasInvalidAttributes, hasUniqueIds, hasUniqueNames } from './attributes';
import { wrapInCode } from './audit-util';

describe('attributes', function () {
  describe('hasInvalidAttributes', function () {
    it('should not return audit error when fields have no attributes', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'form', children: [{ name: 'button' }] }] });
      const result = hasInvalidAttributes(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when form contains valid attributes', function () {
      const tree = getTreeNodeWithParents({
        children: [
          {
            name: 'form',
            attributes: {
              'accept-charset': '',
              'action': '',
              'autocomplete': '',
              'enctype': '',
              'method': '',
              'name': '',
              'novalidate': '',
              'target': '',
              'rel': '',
              'lang': '',
            },
          },
        ],
      });
      const result = hasInvalidAttributes(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error with aria attributes', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'form', attributes: { 'aria-something': 'yes' } }] });
      const result = hasInvalidAttributes(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error with data attributes', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'form', attributes: { 'data-something': 'yes' } }] });
      const result = hasInvalidAttributes(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error with event handler attributes', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'form', attributes: { onclick: 'alert' } }] });
      const result = hasInvalidAttributes(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error when field contains invalid attribute', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'form', attributes: { for: 'something' } }] });
      const result = hasInvalidAttributes(tree);
      expect(result.length).toEqual(1);
      expect(result[0].details).toContain(wrapInCode('<form for="something">'));
      expect(result[0].details).toContain(': <strong><code>for</code></strong>');
      expect(result[0].items[0].name).toEqual('form');
      expect(result[0].items[0].context.invalidAttributes).toEqual([{ attribute: 'for', suggestion: null }]);
      expect(result[0].learnMore).toContain(result[0].references[0].title);
      expect(result[0].learnMore).toContain(result[0].references[0].url);
      expect(result[0].type).toEqual('warning');
    });

    it('should not return audit error when label contains valid attributes', function () {
      const tree = getTreeNodeWithParents({
        children: [
          {
            name: 'label',
            attributes: {
              for: 'something',
              lang: '',
            },
          },
        ],
      });
      const result = hasInvalidAttributes(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when button contains valid attributes', function () {
      const tree = getTreeNodeWithParents({
        children: [
          {
            name: 'button',
            attributes: {
              disabled: '',
              form: '',
              formaction: '',
              formenctype: '',
              formmethod: '',
              formnovalidate: '',
              formtarget: '',
              name: '',
              type: '',
              value: '',
              lang: '',
            },
          },
        ],
      });
      const result = hasInvalidAttributes(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when input contains valid attributes', function () {
      const tree = getTreeNodeWithParents({
        children: [
          {
            name: 'input',
            attributes: {
              accept: '',
              alt: '',
              autocomplete: '',
              autocorrect: '',
              checked: '',
              dirname: '',
              disabled: '',
              form: '',
              formaction: '',
              formenctype: '',
              formmethod: '',
              formnovalidate: '',
              formtarget: '',
              height: '',
              list: '',
              max: '',
              maxlength: '',
              min: '',
              minlength: '',
              multiple: '',
              name: '',
              pattern: '',
              placeholder: '',
              readonly: '',
              required: '',
              size: '',
              src: '',
              step: '',
              type: '',
              value: '',
              width: '',
              title: '',
              lang: '',
            },
          },
        ],
      });
      const result = hasInvalidAttributes(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when select contains valid attributes', function () {
      const tree = getTreeNodeWithParents({
        children: [
          {
            name: 'select',
            attributes: {
              autocomplete: '',
              disabled: '',
              form: '',
              multiple: '',
              name: '',
              required: '',
              size: '',
              lang: '',
            },
          },
        ],
      });
      const result = hasInvalidAttributes(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when textarea contains valid attributes', function () {
      const tree = getTreeNodeWithParents({
        children: [
          {
            name: 'textarea',
            attributes: {
              autocomplete: '',
              cols: '',
              dirname: '',
              disabled: '',
              form: '',
              maxlength: '',
              minlength: '',
              lang: '',
            },
          },
        ],
      });
      const result = hasInvalidAttributes(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error when field contains invalid attribute (with suggestion)', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'form', attributes: { autcomplete: 'something' } }] });
      const result = hasInvalidAttributes(tree);
      expect(result.length).toEqual(1);
      expect(result[0].details).toContain(wrapInCode('<form ...>'));
      expect(result[0].details).toContain(
        ': <strong><code>autcomplete</code></strong> (did you mean <code>autocomplete</code>?)',
      );
      expect(result[0].items[0].name).toEqual('form');
      expect(result[0].items[0].context.invalidAttributes).toEqual([
        { attribute: 'autcomplete', suggestion: 'autocomplete' },
      ]);
      expect(result[0].learnMore).toContain(result[0].references[0].title);
      expect(result[0].learnMore).toContain(result[0].references[0].url);
      expect(result[0].type).toEqual('warning');
    });
  });

  describe('hasIdOrName', function () {
    it('should not return audit error when field has id', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { id: 'input' } }] });
      const result = hasIdOrName(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when field has name', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input', attributes: { name: 'input' } }] });
      const result = hasIdOrName(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when button does not have id or name', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'button' }] });
      const result = hasIdOrName(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error when field does not have id or name', function () {
      const tree = getTreeNodeWithParents({ children: [{ name: 'input' }] });
      const result = hasIdOrName(tree);
      expect(result.length).toEqual(1);
      expect(result[0].details).toContain(wrapInCode('<input>'));
      expect(result[0].items[0].name).toEqual('input');
      expect(result[0].learnMore).toContain(result[0].references[0].title);
      expect(result[0].learnMore).toContain(result[0].references[0].url);
      expect(result[0].type).toEqual('warning');
    });
  });

  describe('hasUniqueIds', function () {
    it('should not return audit error when form has single field with unique id', function () {
      const tree = getTreeNodeWithParents({ name: 'form', children: [{ name: 'input', attributes: { id: 'input' } }] });
      const result = hasUniqueIds(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when form has multiple fields with unique id', function () {
      const tree = getTreeNodeWithParents({
        name: 'form',
        children: [
          { name: 'input', attributes: { id: 'input1' } },
          { name: 'input', attributes: { id: 'input2' } },
        ],
      });
      const result = hasUniqueIds(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error when form has multiple fields with the same id', function () {
      const tree = getTreeNodeWithParents({
        name: 'form',
        children: [
          { name: 'input', attributes: { id: 'input', name: 'input1' } },
          { name: 'input', attributes: { id: 'input', name: 'input2' } },
        ],
      });
      const result = hasUniqueIds(tree);
      expect(result.length).toEqual(1);
      expect(result[0].details).toContain(wrapInCode('<input id="input" name="input1">'));
      expect(result[0].details).toContain(wrapInCode('<input id="input" name="input2">'));
      expect(result[0].items[0].attributes.name).toEqual('input1');
      expect(result[0].items[0].context.duplicates[0].attributes.name).toEqual('input2');
      expect(result[0].learnMore).toContain(result[0].references[0].title);
      expect(result[0].learnMore).toContain(result[0].references[0].url);
      expect(result[0].type).toEqual('error');
    });
  });

  describe('hasUniqueNames', function () {
    it('should not return audit error when form has single field with unique name', function () {
      const tree = getTreeNodeWithParents({
        name: 'form',
        children: [{ name: 'input', attributes: { name: 'input' } }],
      });
      const result = hasUniqueNames(tree);
      expect(result).toEqual([]);
    });

    it('should not return audit error when form has multiple fields with unique name', function () {
      const tree = getTreeNodeWithParents({
        name: 'form',
        children: [
          { name: 'input', attributes: { name: 'input1' } },
          { name: 'input', attributes: { name: 'input2' } },
        ],
      });
      const result = hasUniqueNames(tree);
      expect(result).toEqual([]);
    });

    it('should return audit error when form has multiple fields with the same name', function () {
      const tree = getTreeNodeWithParents({
        name: 'form',
        children: [
          { name: 'input', attributes: { id: 'input1', name: 'input' } },
          { name: 'input', attributes: { id: 'input2', name: 'input' } },
        ],
      });
      const result = hasUniqueNames(tree);
      expect(result.length).toEqual(1);
      expect(result[0].details).toContain(wrapInCode('<input id="input1" name="input">'));
      expect(result[0].details).toContain(wrapInCode('<input id="input2" name="input">'));
      expect(result[0].items[0].attributes.id).toEqual('input1');
      expect(result[0].items[0].context.duplicates[0].attributes.id).toEqual('input2');
      expect(result[0].learnMore).toContain(result[0].references[0].title);
      expect(result[0].learnMore).toContain(result[0].references[0].url);
      expect(result[0].type).toEqual('error');
    });

    it('should not return audit error when form has multiple fields with the same name in different forms', function () {
      const tree = getTreeNodeWithParents({
        name: 'html',
        children: [
          {
            name: 'form',
            children: [{ name: 'input', attributes: { id: 'input1', name: 'input' } }],
          },
          {
            name: 'form',
            children: [{ name: 'input', attributes: { id: 'input2', name: 'input' } }],
          },
        ],
      });
      const result = hasUniqueNames(tree);
      expect(result).toEqual([]);
    });
  });
});
