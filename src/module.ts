import { getTreeNodeWithParents } from './lib/tree-util';
import { runAudits } from './lib/audits/audits';
import { makeAuditDetailsSerializable } from './lib/audits/audit-util';

export function audit(tree: TreeNode): SerializableAuditDetails {
  return makeAuditDetailsSerializable(runAudits(getTreeNodeWithParents(tree)));
}
