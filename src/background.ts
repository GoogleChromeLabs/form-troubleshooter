/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { setupRouting } from 'preact-cli/sw/';

setupRouting();

chrome.runtime.onInstalled.addListener(() => {
  // console.log('Hi from `installed` event listener in background.js!');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.broadcast) {
    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, message, response => {
        if (message.wait) {
          sendResponse(response);
        }
      });
    }
  }

  return message.wait;
});
