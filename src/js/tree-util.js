/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { groupBy } from './array-util';

/**
 * Copies a tree, adding parent relationships
 *
 * @param {TreeNode} parent
 * @returns {TreeNodeWithParent}
 */
export function getTreeNodeWithParents(parent) {
  const root = Object.assign({ attributes: {} }, parent);
  const queue = [root];
  let item;

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
 *
 * @param {TreeNode} parent
 * @param {string[]} tagNames
 * @returns {TreeNodeWithParent[]}
 */
export function findDescendants(parent, tagNames) {
  const queue = [...(parent.children || [])];
  const results = [];
  let item;

  while ((item = queue.shift())) {
    if (tagNames.some(t => t === item.name)) {
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
 *
 * @param {TreeNode} parent
 * @returns {string}
 */
export function getTextContent(parent) {
  const queue = [parent];
  const results = [];
  let item;

  while ((item = queue.shift())) {
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
 *
 * @param {TreeNodeWithParent} node
 * @param {string} tagName
 * @returns {TreeNodeWithParent | null}
 */
export function closestParent(node, tagName) {
  let currentNode = node;
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
export function getPath(node) {
  let currentNode = node;
  let pathSegments = [];

  while (currentNode) {
    pathSegments.unshift(getPathSegment(currentNode));
    currentNode = currentNode.parent;
  }
  return `/${pathSegments.join('/')}`;
}

/**
 * Gets a parent unique path segment for the node
 *
 * @param {TreeNodeWithParent} node
 * @returns {string}
 */
function getPathSegment(node) {
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
  if (siblingsOfType.length === 1) {
    return node.name;
  } else {
    const index = siblingsOfType.indexOf(node);
    return `${node.name}[${index}]`;
  }
}

/**
 * Converts a path to a css query selector
 *
 * @param {string} path
 * @returns {string}
 */
export function pathToQuerySelector(path) {
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
