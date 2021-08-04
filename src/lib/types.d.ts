/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

interface AuditDetails {
  score: number;
  results: AuditResult[];
}

interface AuditResult<T = unkown> {
  auditType: string;
  title: string;
  items: TreeNodeWithContext<T>[];
  details?: string;
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

interface TreeNodeWithContext<T> extends TreeNodeWithParent {
  context?: T;
}

interface LearnMoreReference {
  title: string;
  url: string;
}

interface ContextSuggestion {
  suggestion?: string | null;
}

interface ContextDuplicates {
  duplicates?: TreeNodeWithParent[];
}
