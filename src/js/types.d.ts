/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

interface AuditResult {
  title: string;
  details: string;
  type: 'error' | 'warning';
  learnMore?: string;
}

type AuditHandler = (tree: TreeNodeWithParent) => AuditResult[];

interface TreeNode {
  name?: string;
  text?: string;
  type?: string;
  children?: TreeNode[];
  attributes?: { [key: string]: string };
}

interface TreeNodeWithParent {
  name?: string;
  text?: string;
  type?: string;
  children: TreeNodeWithParent[];
  attributes: { [key: string]: string };
  parent?: TreeNodeWithParent;
}

interface ElementProperties {
  formAncestorID?: string;
  tagName: string;
  attributes: { [key: string]: any };
}
