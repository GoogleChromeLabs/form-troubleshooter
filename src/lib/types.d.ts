/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

interface AuditDetails {
  score: number;
  results: AuditResult[];
}

interface AuditResult {
  title: string;
  items: TreeNodeWithContext[];
  details: string;
  type: 'error' | 'warning';
  learnMore?: string;
  references: LearnMoreReference[];
}

interface TreeNode {
  name?: string;
  text?: string;
  type?: string;
  children?: TreeNode[];
  attributes?: { [key: string]: string };
}

interface TreeNodeWithParent extends TreeNode {
  children: TreeNodeWithParent[];
  attributes: { [key: string]: string };
  parent?: TreeNodeWithParent;
}

interface TreeNodeWithContext extends TreeNodeWithParent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
}

interface LearnMoreReference {
  title: string;
  url: string;
}
