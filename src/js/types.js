/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

/**
 * @typedef {{title: string, details: string, type: 'error' | 'warning', learnMore?: string}} AuditResult
 * @typedef {(tree: TreeNodeWithParent) => AuditResult[]} AuditHandler
 * @typedef {{name?: string, text?: string, type?: string, children?: TreeNode[], attributes?: {[key: string]: string}}} TreeNode
 * @typedef {{name?: string, text?: string, type?: string, children: TreeNodeWithParent[], attributes: {[key: string]: string}, parent?: TreeNodeWithParent}} TreeNodeWithParent
 * @typedef {{formAncestorID?: string, tagName: string, attributes: [key: string]: any}} ElementProperties
 */
