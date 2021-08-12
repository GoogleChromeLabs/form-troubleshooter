/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

interface AuditDetails {
  score: number;
  errors: AuditResult[];
  warnings: AuditResult[];
}

interface AuditResult<T = unkown> {
  auditType: string;
  items: TreeNodeWithContext<T>[];
  score: number;
}

interface SerializableAuditDetails {
  score: number;
  errors: SerializableAuditResult[];
  warnings: SerializableAuditResult[];
}

interface SerializableAuditResult {
  auditType: string;
  items: Array<TreeNode & { path?: string }>;
  score: number;
}

interface TreeNode {
  name?: string | null;
  text?: string | null;
  type?: string | null;
  children?: TreeNode[];
  attributes?: { [key: string]: string };
}

interface TreeNodeWithParent extends TreeNode {
  children: TreeNodeWithParent[];
  attributes: { [key: string]: string };
  parent?: TreeNodeWithParent;
}

interface TreeNodeWithContext<T> extends TreeNodeWithParent {
  original?: TreeNodeWithParent;
  context?: T;
}

interface LearnMoreReference {
  title: string;
  url: string;
}

interface ContextSuggestion {
  token?: string | null;
  suggestion?: string | null;
}

interface ContextReasons {
  reasons: Array<{ type: string; reference: string }>;
}

interface ContextText {
  text: string;
}

interface ContextAutocompleteValue {
  id?: string;
  name?: string;
}

interface ContextFields {
  fields: TreeNodeWithParent[];
}

interface ContextInvalidAttributes {
  invalidAttributes: Array<{ attribute: string; suggestion: string | null }>;
}

interface ContextDuplicates {
  duplicates?: TreeNodeWithParent[];
}

interface AuditMetadata {
  type: 'error' | 'warning';
  weight: number;
  audit: (tree: TreeNodeWithParent) => AuditResult | undefined;
}
