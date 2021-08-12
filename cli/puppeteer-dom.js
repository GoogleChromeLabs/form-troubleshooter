async function getDocumentTree() {
  const IGNORE_CHILDREN = ['head', 'script', 'style', 'svg', 'textarea'];
  const IGNORE_ATTRIBUTES = ['autofill-information', 'autofill-prediction', 'value', /^data-/i];

  function isElementVisible(elem) {
    if (elem instanceof HTMLElement) {
      return !!(
        elem.offsetParent ||
        elem.offsetWidth ||
        elem.offsetHeight ||
        (elem.getClientRects && elem.getClientRects().length)
      );
    }
    return true;
  }

  function convertNodeToTreeNode(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tree = {
        name: node.nodeName.toLowerCase(),
      };
      const attributes = Array.from(node.attributes)
        .filter(
          a =>
            !IGNORE_ATTRIBUTES.some(
              ignored => (typeof ignored !== 'string' && ignored.test(a.name)) || a.name === ignored,
            ),
        )
        .map(a => [a.name, a.value ? a.nodeValue.trim().substring(0, 100) : undefined]);

      if (attributes.length) {
        tree.attributes = Object.fromEntries(attributes);
      }

      return tree;
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue ? node.nodeValue.trim().substring(0, 100) : null;
      if (text) {
        return {
          text,
        };
      }
    }
  }

  const nodeFilter = {
    acceptNode(node) {
      if (
        IGNORE_CHILDREN.some(ignored => node.parentNode && node.parentNode.nodeName.toLocaleLowerCase() === ignored)
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  };

  const walker = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, nodeFilter);
  let currentNode;
  const nodesByParent = new Map();

  nodesByParent.set(null, [document]);

  while ((currentNode = walker.nextNode())) {
    const parent = currentNode.parentNode;

    if (isElementVisible(parent)) {
      if (nodesByParent.has(parent)) {
        nodesByParent.get(parent).push(currentNode);
      } else {
        nodesByParent.set(parent, [currentNode]);
      }
    }
  }

  const rootTree = convertNodeToTreeNode(document) || {};
  const map = new Map([[document, rootTree]]);

  const entries = Array.from(nodesByParent.entries()).filter(([parent]) => parent);

  for (const [parent, nodes] of entries) {
    let parentTree = map.get(parent);

    if (!parentTree) {
      parentTree = convertNodeToTreeNode(parent);
      if (parentTree) {
        map.set(parent, parentTree);
      } else {
        continue;
      }
    }

    if (!parentTree.children && nodes.length) {
      parentTree.children = [];
    }

    for (const child of nodes) {
      const childTree = convertNodeToTreeNode(child);
      if (!childTree) {
        continue;
      }

      map.set(child, childTree);

      // web components and shadow root
      if (child instanceof Element && child.shadowRoot) {
        if (!childTree.children) {
          childTree.children = [];
        }

        const shadowTree = await getDocumentTree(child.shadowRoot);
        childTree.children.push({ type: '#shadow-root', children: [...(shadowTree.children || [])] });
      }

      parentTree.children.push(childTree);
    }
  }

  return rootTree;
}

module.exports = {
  getDocumentTree,
};
