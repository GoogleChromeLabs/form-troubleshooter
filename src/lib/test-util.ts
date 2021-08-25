/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

export function createNode(tree: TreeNode, document?: Document, parent?: Node): Node {
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
