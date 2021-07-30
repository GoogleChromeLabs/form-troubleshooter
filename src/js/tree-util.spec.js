/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { expect } from 'chai';
import { closestParent, findDescendants, getTextContent, getTreeNodeWithParents } from './tree-util';

describe('tree-util', function () {
  describe('getTreeNodeWithParents', function () {
    it('should return empty tree when no node is specified', function () {
      const result = getTreeNodeWithParents();
      expect(result).to.eql({
        attributes: {},
        children: [],
      });
    });

    it('should return node initializing children and attributes', function () {
      const result = getTreeNodeWithParents({ name: 'root' });
      expect(result).to.eql({
        name: 'root',
        attributes: {},
        children: [],
      });
    });

    it('should return node with attributes', function () {
      const result = getTreeNodeWithParents({ name: 'root', attributes: { hello: 'world' } });
      expect(result).to.eql({
        name: 'root',
        attributes: { hello: 'world' },
        children: [],
      });
    });

    it('should return node with children and parent', function () {
      const result = getTreeNodeWithParents({
        name: 'root',
        children: [{ name: 'a' }, { name: 'b', children: [{ name: 'c' }] }],
      });
      const [a, b] = result.children;
      const [c] = b.children;
      expect(a.name).to.equal('a');
      expect(a.parent).to.equal(result);
      expect(a.attributes).to.not.be.undefined;
      expect(a.children).to.not.be.undefined;
      expect(b.name).to.equal('b');
      expect(b.parent).to.equal(result);
      expect(b.attributes).to.not.be.undefined;
      expect(b.children).to.not.be.undefined;
      expect(c.name).to.equal('c');
      expect(c.parent).to.equal(b);
      expect(c.attributes).to.not.be.undefined;
      expect(c.children).to.not.be.undefined;
    });
  });

  describe('findDescendants', function () {
    it('should find descendants from multiple depths', function () {
      const tree = getTreeNodeWithParents({
        name: 'root',
        children: [{ name: 'a' }, { name: 'b', children: [{ name: 'c' }, { name: 'b' }] }],
      });
      const results = findDescendants(tree, ['b']);
      expect(results.length).to.equal(2);
      expect(results[0].name).to.equal('b');
      expect(results[1].name).to.equal('b');
    });

    it('should find descendants from multiple depths with multiple tag names', function () {
      const tree = getTreeNodeWithParents({
        name: 'root',
        children: [{ name: 'a' }, { name: 'b', children: [{ name: 'c' }, { name: 'a' }] }],
      });
      const results = findDescendants(tree, ['a', 'c', 'g']);
      expect(results.length).to.equal(3);
      expect(results[0].name).to.equal('a');
      expect(results[1].name).to.equal('c');
      expect(results[2].name).to.equal('a');
    });
  });

  describe('getTextContent', function () {
    it('should get text content from non text node', function () {
      const tree = getTreeNodeWithParents({ name: 'root' });
      const result = getTextContent(tree);
      expect(result).to.equal('');
    });

    it('should get text content from single node', function () {
      const tree = getTreeNodeWithParents({ text: 'root' });
      const result = getTextContent(tree);
      expect(result).to.equal('root');
    });

    it('should get text content from tree', function () {
      const tree = getTreeNodeWithParents({ text: 'root', children: [{ text: 'a' }, { text: 'b' }] });
      const result = getTextContent(tree);
      expect(result).to.equal('root a b');
    });

    it('should get text content from deep tree', function () {
      const tree = getTreeNodeWithParents({
        text: 'root',
        children: [{ text: 'a' }, { text: 'b', children: [{ text: '1' }, { text: '2' }] }, { text: 'c' }],
      });
      const result = getTextContent(tree);
      expect(result).to.equal('root a b 1 2 c');
    });

    it('should get text content from deep tree where parent has no text', function () {
      const tree = getTreeNodeWithParents({
        children: [{ text: 'a' }, { children: [{ text: 'b1' }, { text: 'b2' }] }, { text: 'c' }],
      });
      const result = getTextContent(tree);
      expect(result).to.equal('a b1 b2 c');
    });
  });

  describe('closestParent', function () {
    let tree;

    before(function () {
      tree = getTreeNodeWithParents({
        name: 'root',
        children: [
          {
            name: 'a',
            attributes: { level: '1' },
            children: [
              { name: 'c' },
              {
                name: 'd',
                children: [
                  { name: 'e' },
                  {
                    name: 'a',
                    attributes: { level: '2' },
                    children: [{ name: 'g' }, { name: 'h' }],
                  },
                ],
              },
            ],
          },
          { name: 'b' },
        ],
      });
    });

    it('should get nearest parent (root)', function () {
      const [node] = findDescendants(tree, ['g']);
      const result = closestParent(node, 'root');
      expect(result.name).to.equal('root');
    });

    it('should return null when parent not found', function () {
      const [node] = findDescendants(tree, ['g']);
      const result = closestParent(node, 'other');
      expect(result).to.be.null;
    });

    it('should get nearest immediate parent', function () {
      const [node] = findDescendants(tree, ['g']);
      const result = closestParent(node, 'a');
      expect(result.name).to.equal('a');
      expect(result.attributes.level).to.equal('2');
    });

    it('should get nearest non-immediate parent', function () {
      const [node] = findDescendants(tree, ['g']);
      const result = closestParent(node, 'd');
      expect(result.name).to.equal('d');
    });
  });
});
