/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

async function expandStyleSheet(element: Element) {
  if (
    element.nodeName.toLowerCase() === 'link' &&
    element.getAttribute('rel') === 'stylesheet' &&
    element.getAttribute('href')
  ) {
    const href = element.getAttribute('href');
    const response = await window.fetch(href as RequestInfo);
    const text = await response.text();

    return `<style>${text}</style>`;
  }
  return element.outerHTML;
}

function createElement(elementType: string, attributes: { [key: string]: string }, text?: string) {
  const element = document.createElement(elementType);

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });

  if (text) {
    element.textContent = text;
  }

  return element;
}

export async function generateHtmlString(
  bodyElements: Element[],
  metadata: { [key: string]: unknown },
  optionalHeadElements?: Element[],
): Promise<string> {
  const headElements = [
    ...Object.entries(metadata).map(([key, value]) =>
      createElement('script', { type: 'text/json', name: key }, JSON.stringify(value)),
    ),
    ...(optionalHeadElements ?? Array.from(document.head.querySelectorAll('title, style, link[rel="stylesheet"]'))),
  ];

  return [
    `<!DOCTYPE html>`,
    `<html>`,
    `<head>${(await Promise.all(headElements.map(expandStyleSheet))).join('')}</head>`,
    `<body>${bodyElements.map(element => element.outerHTML).join('')}</body>`,
    `</html>`,
  ].join('\n');
}
