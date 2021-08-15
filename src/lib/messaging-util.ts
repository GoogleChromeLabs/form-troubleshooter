/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

let messageCounter = 0;
const messageHandlers = new Map<number, (response: any) => void>();
window.addEventListener('message', event => {
  if (event.data?.message === 'iframe message response') {
    const callback = messageHandlers.get(event.data?.messageId);
    if (callback) {
      messageHandlers.delete(event.data?.messageId);
      callback(event.data.data);
    }
  }
});
export function sendMessageToIframe<T>(frame: HTMLIFrameElement, message: any, timeoutDuration = 500): Promise<T> {
  const messageId = ++messageCounter;
  frame.contentWindow?.postMessage(
    {
      message: 'iframe message',
      messageId,
      data: message,
    },
    '*',
  );
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout duration exceeded'));
    }, timeoutDuration);
    messageHandlers.set(messageId, response => {
      clearTimeout(timeout);
      resolve(response);
    });
  });
}
