/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

export function waitFor<T>(predicate: () => T, timeoutMilliseconds = 500, pollMilliseconds = 10): Promise<T> {
  return new Promise((resolve, reject) => {
    let interval: NodeJS.Timer | undefined;

    // get ready to reject if predicate doesn't resolve in time
    const timeout = setTimeout(() => {
      if (interval) {
        clearInterval(interval);
      }
      reject(new Error('Timeout duration exceeded'));
    }, timeoutMilliseconds);

    // check predicate as soon as possible (but not synchronously)
    setTimeout(() => {
      let ready = predicate();
      if (ready) {
        clearTimeout(timeout);
        resolve(ready);
      } else {
        // poll for changes
        interval = setInterval(() => {
          ready = predicate();
          if (ready) {
            clearTimeout(timeout);
            if (interval) {
              clearInterval(interval);
            }
            resolve(ready);
          }
        }, pollMilliseconds);
      }
    }, 0);
  });
}
