/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

jest.mock('./image-info-util');

import { getImageInfo } from './image-info-util';
import { createNode } from './test-util';
import { getWebsiteIcon } from './webpage-icon-util';

function createDocumentWithHead(headElements: TreeNode[]) {
  const document = new Document();

  document.appendChild(
    createNode({
      name: 'html',
      children: [
        {
          name: 'head',
          children: headElements,
        },
      ],
    }),
  );

  return document;
}

describe('getWebsiteIcon', function () {
  beforeEach(() => {
    (getImageInfo as jest.Mock).mockImplementation(src => {
      return Promise.resolve({
        src: `http://localhost/${src}`,
        width: 100,
        height: 100,
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty string when no icon is found', async function () {
    const document = createDocumentWithHead([]);
    await getWebsiteIcon(document);
    expect(getImageInfo).not.toBeCalled();
  });

  it('should return data uri when icon is found', async function () {
    const document = createDocumentWithHead([
      {
        name: 'link',
        attributes: { rel: 'icon', href: 'icon.png' },
      },
    ]);
    const result = await getWebsiteIcon(document);
    expect(getImageInfo).toBeCalledWith('icon.png');
    expect(result).toEqual({ src: 'http://localhost/icon.png', width: 100, height: 100 });
  });

  it('should return data apple-touch-icon when multiple icons are present', async function () {
    const document = createDocumentWithHead([
      {
        name: 'link',
        attributes: { rel: 'icon', href: 'icon.png' },
      },
      {
        name: 'link',
        attributes: { rel: 'apple-touch-icon', href: 'apple-touch-icon.png' },
      },
      {
        name: 'link',
        attributes: { rel: 'shortcut icon', href: 'shortcut icon.png' },
      },
    ]);
    const result = await getWebsiteIcon(document);
    expect(getImageInfo).toBeCalledWith('apple-touch-icon.png');
    expect(result).toEqual({ src: 'http://localhost/apple-touch-icon.png', width: 100, height: 100 });
  });

  it('should return data shortcut icon when multiple icons are present (excluding apple-touch-icon)', async function () {
    const document = createDocumentWithHead([
      {
        name: 'link',
        attributes: { rel: 'icon', href: 'icon.png' },
      },
      {
        name: 'link',
        attributes: { rel: 'shortcut icon', href: 'shortcut icon.png' },
      },
    ]);
    const result = await getWebsiteIcon(document);
    expect(getImageInfo).toBeCalledWith('shortcut icon.png');
    expect(result).toEqual({ src: 'http://localhost/shortcut icon.png', width: 100, height: 100 });
  });
});
