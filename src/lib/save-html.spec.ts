/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { generateHtmlString } from './save-html';
import { createNode } from './test-util';

describe('generateHtmlString', function () {
  beforeAll(() => {
    jest.spyOn(global, 'fetch').mockImplementation(url => {
      return Promise.resolve({
        text() {
          return Promise.resolve('body { width: 100% }');
        },
      } as Response);
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should return empty HTML string', async function () {
    const result = await generateHtmlString([], { version: '1' }, []);
    expect(result).toEqual(
      `<!DOCTYPE html>\n<html>\n<head><script type="text/json" name="version">"1"</script></head>\n<body></body>\n</html>`,
    );
  });

  it('should return basic HTML string', async function () {
    const result = await generateHtmlString(
      [createNode({ name: 'p', children: [{ text: 'hello world' }] })] as Element[],
      { json: { hello: 'world' } },
      [
        createNode({ name: 'title', children: [{ text: 'My title' }] }),
        createNode({ name: 'style', children: [{ text: 'html { width: 100% }' }] }),
      ] as Element[],
    );
    expect(result).toEqual(
      `<!DOCTYPE html>\n<html>\n<head><script type="text/json" name="json">{"hello":"world"}</script><title>My title</title><style>html { width: 100% }</style></head>\n<body><p>hello world</p></body>\n</html>`,
    );
  });

  it('should return HTML embedding external stylesheet', async function () {
    const result = await generateHtmlString(
      [createNode({ name: 'p', children: [{ text: 'hello world' }] })] as Element[],
      { version: '1', json: { hello: 'world' } },
      [
        createNode({ name: 'style', children: [{ text: 'html { width: 100% }' }] }),
        createNode({ name: 'link', attributes: { rel: 'stylesheet', href: 'style.css' } }),
      ] as Element[],
    );
    expect(result).toEqual(
      `<!DOCTYPE html>\n<html>\n<head><script type="text/json" name="version">"1"</script><script type="text/json" name="json">{"hello":"world"}</script><style>html { width: 100% }</style><style>body { width: 100% }</style></head>\n<body><p>hello world</p></body>\n</html>`,
    );
  });
});
