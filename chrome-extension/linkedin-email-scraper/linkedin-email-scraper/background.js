// Background Service Worker
// Stores emails and relays messages between content script and popup

let emailStore = new Set();
let isScraping = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === 'EMAIL_FOUND') {
    emailStore.add(message.email);
    // Forward to popup if open
    chrome.runtime.sendMessage({
      type: 'EMAIL_UPDATE',
      email: message.email,
      total: emailStore.size
    }).catch(() => {}); // popup may be closed, ignore error
  }

  if (message.type === 'SCRAPE_DONE') {
    isScraping = false;
    chrome.runtime.sendMessage({
      type: 'SCRAPE_COMPLETE',
      total: emailStore.size,
      emails: Array.from(emailStore)
    }).catch(() => {});
  }

  if (message.type === 'CLEAR_EMAILS') {
    emailStore.clear();
    isScraping = false;
    sendResponse({ status: 'cleared' });
  }

  if (message.type === 'GET_ALL_EMAILS') {
    sendResponse({
      emails: Array.from(emailStore),
      total: emailStore.size,
      scraping: isScraping
    });
  }

  if (message.type === 'SET_SCRAPING') {
    isScraping = message.value;
  }

  return true;
});
