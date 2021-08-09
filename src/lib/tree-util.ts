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
      queue.push(...item.children);
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
    return `${node.name}#${node.attributes.id}`;
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
