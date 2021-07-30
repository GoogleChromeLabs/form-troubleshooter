/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

/**
 * Copies a tree, adding parent relationships
 *
 * @param {TreeNode} parent
 * @returns {TreeNodeWithParent}
 */
export function getTreeNodeWithParents(parent) {
  const root = Object.assign({attributes: {}}, parent);
  const queue = [root];
  let item;

  while ((item = queue.shift())) {
    if (item.children) {
      item.children = item.children.map(c => (Object.assign({attributes: {}}, c, {parent: item})));
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
