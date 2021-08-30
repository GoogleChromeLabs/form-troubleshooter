/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

declare module '*.css' {
  const mapping: Record<string, string>;
  export default mapping;
}

declare module 'preact-cli/sw/' {
  export function setupRouting();
}
