/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export function sendMessageAndWait<T>(message: any, timeoutDuration = 500): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout duration exceeded'));
    }, timeoutDuration);
    chrome.runtime.sendMessage(message, response => {
      clearTimeout(timeout);
      resolve(response);
    });
  });
}
