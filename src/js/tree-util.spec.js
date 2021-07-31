/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { expect } from 'chai';
import {
  closestParent,
  findDescendants,
  getPath,
  getTextContent,
  getTreeNodeWithParents,
  pathToQuerySelector,
} from './tree-util';

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

  describe('getPath', function () {
    let tree;

    beforeEach(function () {
      tree = getTreeNodeWithParents({
        name: 'root',
        children: [
          {
            name: 'a',
            attributes: { level: '1' },
            children: [
              { name: 'c', attributes: { position: '1' } },
              { name: 'c', attributes: { position: '2' }, children: [{ name: 'q' }, { name: 'u' }] },
              { name: 'c', attributes: { id: 'hasId', position: '3' }, children: [{ name: 'x' }, { name: 'y' }] },
              {
                name: 'd',
                children: [
                  { name: 'e', attributes: { id: 'mye' } },
                  {
                    name: 'a',
                    attributes: { level: '2' },
                    children: [{ name: 'g' }, { name: 'h' }],
                  },
                ],
              },
            ],
          },
          { name: 'b', attributes: { position: '1' } },
          { name: 'b', attributes: { position: '2' } },
          { name: 'b', attributes: { position: '3' } },
        ],
      });
    });

    it('should get root node', function () {
      const result = getPath(tree);
      expect(result).to.equal('/root');
    });

    it('should get root node without name', function () {
      delete tree.name;
      const result = getPath(tree);
      expect(result).to.equal('/');
    });

    it('should get leaf node with id for tree without name', function () {
      delete tree.name;
      const [node] = findDescendants(tree, ['e']);
      const result = getPath(node);
      expect(result).to.equal('//a/d/e#mye');
    });

    it('should get leaf node with id', function () {
      const [node] = findDescendants(tree, ['e']);
      const result = getPath(node);
      expect(result).to.equal('/root/a/d/e#mye');
    });

    it('should get leaf node without id', function () {
      const [node] = findDescendants(tree, ['h']);
      const result = getPath(node);
      expect(result).to.equal('/root/a/d/a/h');
    });

    it('should get leaf node with parent that has id', function () {
      const [node] = findDescendants(tree, ['y']);
      const result = getPath(node);
      expect(result).to.equal('/root/a/c#hasId/y');
    });

    it('should get first leaf node with by index', function () {
      const [node] = findDescendants(tree, ['b']);
      const result = getPath(node);
      expect(result).to.equal('/root/b[0]');
    });

    it('should get second leaf node with by index', function () {
      const [, node] = findDescendants(tree, ['b']);
      const result = getPath(node);
      expect(result).to.equal('/root/b[1]');
    });

    it('should get last leaf node with by index', function () {
      const [, , node] = findDescendants(tree, ['b']);
      const result = getPath(node);
      expect(result).to.equal('/root/b[2]');
    });

    it('should get leaf node with indexed parent', function () {
      const [node] = findDescendants(tree, ['u']);
      const result = getPath(node);
      expect(result).to.equal('/root/a/c[1]/u');
    });
  });

  describe('pathToQuerySelector', function () {
    it('should get root', function () {
      const result = pathToQuerySelector('/root');
      expect(result).to.equal('root');
    });

    it('should get path with position', function () {
      const result = pathToQuerySelector('/root/abc[1]/a');
      expect(result).to.equal('root > abc:nth-of-type(2) > a');
    });

    it('should get path with position (leaf)', function () {
      const result = pathToQuerySelector('/root/abc[1]/a[0]');
      expect(result).to.equal('root > abc:nth-of-type(2) > a:nth-of-type(1)');
    });

    it('should get path with id', function () {
      const result = pathToQuerySelector('/root/abc#myabc/a');
      expect(result).to.equal('root > abc#myabc > a');
    });

    it('should get path with id (leaf)', function () {
      const result = pathToQuerySelector('/root/abc#myabc/a#link');
      expect(result).to.equal('root > abc#myabc > a#link');
    });
  });
});
