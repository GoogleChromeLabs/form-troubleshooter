/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { IGNORE_ATTRIBUTES, IGNORE_CHILDREN } from './constants';
import { sendMessageToIframe } from './messaging-util';
import { condenseWhitespace, truncate } from './string-util';

export async function getDocumentTree(node: Node): Promise<TreeNode> {
  const nodesByParent = getNodesByParent(node);

  const rootTree: TreeNode = convertNodeToTreeNode(node) ?? {};
  const map = new Map<Node | null, TreeNode>([[node, rootTree]]);

  const entries = Array.from(nodesByParent.entries()).filter(([parent]) => parent);

  for (const [parent, nodes] of entries) {
    let parentTree = map.get(parent);

    if (!parentTree) {
      parentTree = convertNodeToTreeNode(parent!);
      if (parentTree) {
        map.set(parent, parentTree);
      } else {
        continue;
      }
    }

    if (!parentTree.children && nodes.length) {
      parentTree.children = [];
    }

    for (const child of nodes) {
      const childTree = convertNodeToTreeNode(child);
      if (!childTree) {
        continue;
      }

      map.set(child, childTree);

      // web components and shadow root
      if (child instanceof Element && child.shadowRoot) {
        if (!childTree.children) {
          childTree.children = [];
        }

        const shadowTree = await getDocumentTree(child.shadowRoot);
        childTree.children.push({ type: '#shadow-root', children: [...(shadowTree.children ?? [])] });
      }

      // iframes
      if (
        (child.nodeName.toLowerCase() === 'iframe' || child instanceof HTMLIFrameElement) &&
        isElementVisible(child) &&
        child instanceof Element &&
        child.getAttribute('src') &&
        child.getAttribute('src') !== 'about:blank'
      ) {
        if (!childTree.children) {
          childTree.children = [];
        }
        const iframeTree = await getIframeDocumentTree(child as HTMLIFrameElement);
        if (iframeTree) {
          childTree.children.push({ type: '#document', children: [iframeTree] });
        }
      }

      parentTree.children?.push(childTree);
    }
  }

  return rootTree;
}

const nodeFilter = {
  acceptNode(node: Node) {
    if (IGNORE_CHILDREN.some(ignored => node.parentNode?.nodeName.toLocaleLowerCase() === ignored)) {
      return NodeFilter.FILTER_REJECT;
    }
    return NodeFilter.FILTER_ACCEPT;
  },
};

export function getNodesByParent(node: Node): Map<Node | null, Node[]> {
  const doc = node instanceof Document ? document : node.ownerDocument!;
  const walker = doc.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, nodeFilter);
  let currentNode: Node | null;
  const nodesByParent = new Map<Node | null, Node[]>();

  nodesByParent.set(null, [node]);

  while ((currentNode = walker.nextNode())) {
    const parent = currentNode.parentNode;

    if (isElementVisible(parent) || isElementVisible(currentNode)) {
      if (nodesByParent.has(parent)) {
        nodesByParent.get(parent)?.push(currentNode);
      } else {
        nodesByParent.set(parent, [currentNode]);
      }
    }
  }

  return nodesByParent;
}

export function convertNodeToTreeNode(node: Node): TreeNode | undefined {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const tree: TreeNode = {
      name: node.nodeName?.toLowerCase(),
    };
    const attributes = Array.from((node as Element).attributes)
      .filter(
        a =>
          !IGNORE_ATTRIBUTES.some(
            ignored => (typeof ignored !== 'string' && ignored.test(a.name)) || a.name === ignored,
          ),
      )
      .map(a => [a.name, truncate(a.value, 400)]);

    if (attributes.length) {
      tree.attributes = Object.fromEntries(attributes);
    }

    return tree;
  } else if (node.nodeType === Node.TEXT_NODE) {
    const text = truncate(condenseWhitespace(node.nodeValue), 400);
    if (text) {
      return {
        text,
      };
    }
  }
}

async function getIframeDocumentTree(iframeElement: HTMLIFrameElement) {
  try {
    const iframeContent: TreeNode = await sendMessageToIframe(iframeElement, {
      type: 'inspect',
    });

    return iframeContent;
  } catch (err) {
    console.error('Failed to get tree from iframe', err, iframeElement);
    return null;
  }
}

function isElementVisible(elem: Node | null): boolean {
  if (elem instanceof HTMLElement) {
    return !!(elem.offsetParent || elem.offsetWidth || elem.offsetHeight || elem.getClientRects?.().length);
  }
  return true;
}
