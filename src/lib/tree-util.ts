/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { groupBy } from './array-util';

/**
 * Copies a tree, adding parent relationships
 */
export function getTreeNodeWithParents(parent?: TreeNode): TreeNodeWithParent {
  const root = Object.assign({ attributes: {} }, parent) as TreeNodeWithParent;
  const queue: TreeNodeWithParent[] = [root];
  let item: TreeNodeWithParent | undefined;

  while ((item = queue.shift())) {
    if (item.children) {
      item.children = item.children.map(c => Object.assign({ attributes: {} }, c, { parent: item }));
      queue.push(...item.children);
    } else {
      item.children = [];
    }
  }

  return root;
}

type TreeNodeConverter = (
  node: TreeNode | TreeNodeWithParent,
  childNodeConverter: TreeNodeConverter | null,
) => TreeNode;
function convertToBareTreeNode(
  node: TreeNode | TreeNodeWithParent,
  childNodeConverter: TreeNodeConverter | null,
): TreeNode {
  const newNode = {} as TreeNode;

  if (node.name !== undefined) {
    newNode.name = node.name;
  }
  if (node.text !== undefined) {
    newNode.text = node.text;
  }
  if (node.type !== undefined) {
    newNode.type = node.type;
  }
  if (node.attributes && Object.keys(node.attributes).length) {
    newNode.attributes = {
      ...node.attributes,
    };
  }
  if (node.children?.length && childNodeConverter) {
    newNode.children = node.children.map(child => childNodeConverter(child, childNodeConverter));
  }

  return newNode;
}

/**
 * Copies a tree, removing non essential properties which is JSON serializable
 *
 * This is the opposite of `getTreeNodeWithParents`
 */
export function getBareTreeNode(node: TreeNodeWithParent, includeChildren = true): TreeNode {
  return convertToBareTreeNode(node, includeChildren ? convertToBareTreeNode : null);
}

/**
 * Finds descendants of a given node by tagName
 */
export function findDescendants(parent: TreeNodeWithParent, tagNames: string[]): TreeNodeWithParent[] {
  const queue = [...(parent.children || [])];
  const results = [];
  let item: TreeNodeWithParent | undefined;

  while ((item = queue.shift())) {
    if (tagNames.some(t => t === item!.name)) {
      results.push(item);
    }
    if (item.children) {
      queue.unshift(...item.children);
    }
  }

  return results;
}

/**
 * Gets text content recursively for a given node
 */
export function getTextContent(parent: TreeNodeWithParent): string {
  const queue = [parent];
  const results = [];
  let item;

  while ((item = queue.shift())) {
    if (item.type === '#document') {
      continue;
    }
    if (item.text) {
      results.push(item.text);
    }
    if (item.children) {
      queue.unshift(...item.children);
    }
  }

  return results.join(' ');
}

/**
 * Searches for the closest parent node with the matching tagName
 */
export function closestParent(node: TreeNodeWithParent, tagName: string): TreeNodeWithParent | null {
  let currentNode: TreeNodeWithParent | undefined = node;
  while ((currentNode = currentNode.parent)) {
    if (tagName === currentNode.name) {
      return currentNode;
    }
  }
  return null;
}

/**
 * Searches for the closest document or shadow root
 */
export function closestRoot(node: TreeNodeWithParent): TreeNodeWithParent {
  let currentNode: TreeNodeWithParent = node;
  while (currentNode.parent) {
    if (currentNode.type === '#document' || currentNode.type === '#shadow-root') {
      return currentNode;
    }

    currentNode = currentNode.parent;
  }
  return currentNode;
}

/**
 * Gets a path to the node separated by `/`
 *
 * @param {TreeNodeWithParent} node
 * @returns {string}
 */
export function getPath(node: TreeNodeWithParent): string {
  let currentNode: TreeNodeWithParent | undefined = node;
  const pathSegments = [];

  while (currentNode) {
    pathSegments.unshift(getPathSegment(currentNode));
    currentNode = currentNode.parent;
  }
  return `/${pathSegments.join('/')}`;
}

const validCssFragmentExpression = /^[-_a-z]+[-_a-z0-9]*$/i;
const validCssFragmentInitialCharactersExpression = /^[-_a-z]/i;
const invalidCssFragmentCharactersExpression = /[^-_a-z0-9]/gi;
export function escapeCssSelectorFragment(fragment: string): string | null {
  if (!validCssFragmentInitialCharactersExpression.test(fragment)) {
    return null;
  }
  if (validCssFragmentExpression.test(fragment)) {
    return fragment;
  }
  return fragment.replace(invalidCssFragmentCharactersExpression, match => `\\${match.charCodeAt(0).toString(16)} `);
}

/**
 * Gets a parent unique path segment for the node
 */
function getPathSegment(node: TreeNodeWithParent | TreeNodeWithContext<unknown>): string {
  if (node.type) {
    return node.type;
  }

  if (!node.name) {
    return '';
  }

  if (node.attributes.id) {
    const idFragment = escapeCssSelectorFragment(node.attributes.id);
    if (idFragment) {
      return `${node.name}#${idFragment}`;
    }
  }

  if (!node.parent) {
    return node.name || '';
  }

  const siblingsByType = groupBy(
    node.parent.children.filter(child => child.name),
    child => child.name,
  );
  const siblingsOfType = siblingsByType.get(node.name);
  if (siblingsOfType?.length === 1) {
    return node.name;
  } else {
    const lookupNode = (node as TreeNodeWithContext<unknown>).original ?? node;
    const index = siblingsOfType!.indexOf(lookupNode);
    if (index === -1) {
      console.log('node', lookupNode);
      throw new Error('Node not found among siblings');
    }
    return `${node.name}[${index}]`;
  }
}

/**
 * Converts a path to a css query selector
 */
export function pathToQuerySelector(path: string): string {
  return path
    .split('/')
    .filter(segment => segment)
    .map(segment =>
      segment.replace(/\[(\d+)\]/, (match, index) => {
        return `:nth-of-type(${Number(index) + 1})`;
      }),
    )
    .join(' > ');
}
