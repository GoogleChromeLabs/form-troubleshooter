import { getTreeNodeWithParents } from './lib/tree-util';
import { runAudits } from './lib/audits/audits';

export { getDocumentTree } from './lib/dom-iterator';
export { getPath } from './lib/tree-util';
export { stringifyFormElement } from './lib/audits/audit-util';

export function audit(tree: TreeNode): AuditDetails {
  return runAudits(getTreeNodeWithParents(tree));
}
