/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { getTreeNodeWithParents } from '../tree-util';
import { hasEmptyForms } from './forms';

describe('forms', function () {
  it('should return audit error when form is empty', function () {
    const tree = getTreeNodeWithParents({ children: [{ name: 'form' }] });
    const result = hasEmptyForms(tree);
    expect(result.length).toEqual(1);
    expect(result[0].items[0].name).toEqual('form');
    expect(result[0].type).toEqual('warning');
  });

  it('should return audit error when one or more forms is empty', function () {
    const tree = getTreeNodeWithParents({
      children: [
        { name: 'form', attributes: { id: 'form1' }, children: [{ name: 'input' }] },
        { name: 'form', attributes: { id: 'form2' } },
      ],
    });
    const result = hasEmptyForms(tree);
    expect(result.length).toEqual(1);
    expect(result[0].items[0].name).toEqual('form');
    expect(result[0].items[0].attributes.id).toEqual('form2');
    expect(result[0].type).toEqual('warning');
  });

  it('should not return audit error when form is contains button', function () {
    const tree = getTreeNodeWithParents({ children: [{ name: 'form', children: [{ name: 'button' }] }] });
    const result = hasEmptyForms(tree);
    expect(result).toHaveLength(0);
  });

  it('should not return audit error when form is contains input', function () {
    const tree = getTreeNodeWithParents({ children: [{ name: 'form', children: [{ name: 'input' }] }] });
    const result = hasEmptyForms(tree);
    expect(result).toHaveLength(0);
  });

  it('should not return audit error when form is contains select', function () {
    const tree = getTreeNodeWithParents({ children: [{ name: 'form', children: [{ name: 'select' }] }] });
    const result = hasEmptyForms(tree);
    expect(result).toHaveLength(0);
  });

  it('should not return audit error when form is contains textarea', function () {
    const tree = getTreeNodeWithParents({ children: [{ name: 'form', children: [{ name: 'textarea' }] }] });
    const result = hasEmptyForms(tree);
    expect(result).toHaveLength(0);
  });
});
