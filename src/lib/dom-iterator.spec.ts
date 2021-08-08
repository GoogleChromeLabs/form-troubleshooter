/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

jest.mock('./messaging-util');

import { convertNodeToTreeNode, getDocumentTree } from './dom-iterator';
import { truncate } from './string-util';
import { sendMessageAndWait } from './messaging-util';

const LONG_TEXT = new Array(401).fill('a').join('');
const TRUCATED_LONG_TEXT = truncate(LONG_TEXT, 400);

function addShadowRoot(element: Element) {
  const fakeRoot = element.ownerDocument.createElement('fake-node');
  Object.defineProperty(fakeRoot, 'parentNode', {
    get() {
      return null;
    },
  });

  Object.defineProperty(element, 'shadowRoot', {
    get() {
      return fakeRoot;
    },
  });
}

function createNode(tree: TreeNode, document?: Document, parent?: Node): Node {
  const doc = document ?? new Document();
  let node: Node | undefined;
  const treeNode = tree;

  if (treeNode.name) {
    node = doc.createElement(treeNode.name);

    if (treeNode.attributes) {
      Object.entries(treeNode.attributes).forEach(([name, value]) => {
        const attribute = doc.createAttribute(name)!;
        attribute.value = value;
        (node as Element).setAttributeNode(attribute);
      });
    }

    if (treeNode.children) {
      treeNode.children.forEach(child => {
        const childNode = createNode(child, doc, node);
        if (childNode) {
          node?.appendChild(childNode);
        }
      });
    }
  } else if (treeNode.text != null) {
    node = doc.createTextNode(treeNode.text);
  } else if (treeNode.type === '#shadow-root') {
    addShadowRoot(parent as Element);
    node = (parent as Element).shadowRoot!;

    if (treeNode.children) {
      treeNode.children.forEach(child => {
        const childNode = createNode(child, doc, node);
        if (childNode) {
          node!.appendChild(childNode);
        }
      });
    }
  } else {
    throw new Error(`Unsupported node ${JSON.stringify(tree)}`);
  }

  return node;
}

describe('convertNodeToTreeNode', function () {
  describe('elements', function () {
    it('should convert element node', function () {
      const result = convertNodeToTreeNode(
        createNode({
          name: 'FORM',
        }),
      );
      expect(result).toEqual({
        name: 'form',
      });
    });

    it('should convert element node with attributes', function () {
      const result = convertNodeToTreeNode(
        createNode({
          name: 'FORM',
          attributes: {
            hello: 'world',
            text: LONG_TEXT,
          },
        }),
      );
      expect(result).toEqual({
        name: 'form',
        attributes: {
          hello: 'world',
          text: TRUCATED_LONG_TEXT,
        },
      });
    });
  });

  describe('text', function () {
    it('should convert text node', function () {
      const result = convertNodeToTreeNode(createNode({ text: 'hello' }));
      expect(result).toEqual({
        text: 'hello',
      });
    });

    it('should ignore text node with empty string', function () {
      const result = convertNodeToTreeNode(createNode({ text: '' }));
      expect(result).toEqual(undefined);
    });

    it('should convert text node with single whitespace', function () {
      const result = convertNodeToTreeNode(createNode({ text: ' ' }));
      expect(result).toEqual({
        text: ' ',
      });
    });

    it('should convert text node with multiple whitespace', function () {
      const result = convertNodeToTreeNode(createNode({ text: '\n\t \t\t' }));
      expect(result).toEqual({
        text: ' ',
      });
    });

    it('should convert text with leading and trailing whitespace', function () {
      const result = convertNodeToTreeNode(createNode({ text: ' \n\t hello\t\t \n ' }));
      expect(result).toEqual({
        text: ' hello ',
      });
    });

    it('should convert and truncate long text', function () {
      const result = convertNodeToTreeNode(createNode({ text: LONG_TEXT }));
      expect(result).toEqual({
        text: TRUCATED_LONG_TEXT,
      });
    });
  });
});

describe('getDocumentTree', function () {
  beforeAll(() => {
    (sendMessageAndWait as jest.Mock).mockReturnValue(
      Promise.resolve({
        name: 'form',
        children: [
          { name: 'label', children: [{ text: 'my label' }] },
          { name: 'input', attributes: { 'id': 'my-input', 'autofill-information': 'abc' } },
        ],
      }),
    );
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should build a document tree filtering child nodes and attributes', async function () {
    const result = await getDocumentTree(
      createNode({
        name: 'form',
        children: [
          {
            name: 'fieldset',
            children: [
              { name: 'label', children: [{ text: 'my label' }] },
              {
                name: 'input',
                attributes: {
                  'id': 'my-input',
                  'autofill-information': 'abc',
                  'type': 'password',
                  'value': 'secret password',
                },
              },
              {
                name: 'svg',
                attributes: { 'width': '100', 'data-something': 'something', 'data': 'some data' },
                children: [{ name: 'g' }],
              },
              { name: 'style', children: [{ text: 'css' }] },
              { name: 'script', children: [{ text: 'javascript' }] },
              { name: 'textarea', attributes: { name: 'text' }, children: [{ text: 'secret password' }] },
            ],
          },
          {
            name: 'custom-element',
            children: [
              {
                type: '#shadow-root',
                children: [{ name: 'div', children: [{ name: 'span', children: [{ text: 'hello' }] }] }],
              },
            ],
          },
          {
            name: 'iframe',
            attributes: { src: 'http://localhost/' },
          },
        ],
      }),
    );
    const expected = {
      name: 'form',
      children: [
        {
          name: 'fieldset',
          children: [
            { name: 'label', children: [{ text: 'my label' }] },
            { name: 'input', attributes: { id: 'my-input', type: 'password' } },
            { name: 'svg', attributes: { width: '100', data: 'some data' } },
            { name: 'style' },
            { name: 'script' },
            { name: 'textarea', attributes: { name: 'text' } },
          ],
        },
        {
          name: 'custom-element',
          children: [
            {
              type: '#shadow-root',
              children: [{ name: 'div', children: [{ name: 'span', children: [{ text: 'hello' }] }] }],
            },
          ],
        },
        {
          name: 'iframe',
          attributes: { src: 'http://localhost/' },
          children: [
            {
              type: '#document',
              children: [
                {
                  name: 'form',
                  children: [
                    { name: 'label', children: [{ text: 'my label' }] },
                    { name: 'input', attributes: { 'id': 'my-input', 'autofill-information': 'abc' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(result).toEqual(expected);
  });
});
