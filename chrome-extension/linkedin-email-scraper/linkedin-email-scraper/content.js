// LinkedIn Email Scraper - Content Script
// Runs in the LinkedIn page context

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

let scraping = false;
let foundEmails = new Set();
let scrollInterval = null;
let observer = null;
let scrollDelay = 2500; // ms between scrolls (safe default)
let noNewContentCount = 0;
let lastScrollY = -1;

// ── Scan any text node for emails ──────────────────────────────────────────
function extractEmailsFromText(text) {
  const matches = text.match(EMAIL_REGEX) || [];
  return matches.filter(email => {
    // Filter out common false positives
    const lower = email.toLowerCase();
    return (
      !lower.endsWith('.png') &&
      !lower.endsWith('.jpg') &&
      !lower.endsWith('.jpeg') &&
      !lower.endsWith('.gif') &&
      !lower.endsWith('.svg') &&
      !lower.includes('sentry') &&
      !lower.includes('example.com') &&
      !lower.includes('wixpress') &&
      !lower.includes('@2x')
    );
  });
}

// ── Scan the entire document for emails ───────────────────────────────────
function scanPage() {
  const bodyText = document.body.innerText || '';
  const emails = extractEmailsFromText(bodyText);
  let newFound = false;

  emails.forEach(email => {
    const normalized = email.toLowerCase().trim();
    if (!foundEmails.has(normalized)) {
      foundEmails.add(normalized);
      newFound = true;
      // Send to background/popup
      chrome.runtime.sendMessage({
        type: 'EMAIL_FOUND',
        email: normalized
      });
    }
  });

  return newFound;
}

// ── Click all "See more" / "Show more" buttons to expand posts ─────────────
function expandPosts() {
  const selectors = [
    'button.feed-shared-inline-show-more-text__see-more-less-toggle',
    'button[aria-label="see more"]',
    '.see-more-less-html__button',
    'button.inline-show-more-text__button',
    '[data-control-name="see_more"]'
  ];

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(btn => {
      try { btn.click(); } catch (e) {}
    });
  });
}

// ── Main scroll + scrape loop ──────────────────────────────────────────────
function startScrolling() {
  scraping = true;
  noNewContentCount = 0;

  // Watch for DOM mutations (new posts loaded)
  observer = new MutationObserver(() => {
    expandPosts();
    scanPage();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  // Initial scan
  expandPosts();
  scanPage();

  // Scroll loop
  scrollInterval = setInterval(() => {
    if (!scraping) {
      clearInterval(scrollInterval);
      return;
    }

    const currentY = window.scrollY;

    // Detect if we've hit the bottom (no movement)
    if (Math.abs(currentY - lastScrollY) < 5 && lastScrollY !== -1) {
      noNewContentCount++;
      if (noNewContentCount >= 4) {
        // Try clicking "Load more" buttons
        const loadMoreSelectors = [
          'button.scaffold-finite-scroll__load-button',
          'button[aria-label="Load more results"]',
          '.artdeco-pagination__button--next',
          'button.see-more-jobs'
        ];

        let clicked = false;
        for (const sel of loadMoreSelectors) {
          const btn = document.querySelector(sel);
          if (btn) {
            btn.click();
            clicked = true;
            noNewContentCount = 0;
            break;
          }
        }

        if (!clicked && noNewContentCount >= 8) {
          // Truly reached the end
          stopScraping();
          chrome.runtime.sendMessage({ type: 'SCRAPE_DONE', total: foundEmails.size });
          return;
        }
      }
    } else {
      noNewContentCount = 0;
    }

    lastScrollY = currentY;
    window.scrollBy({ top: 800, behavior: 'smooth' });
    expandPosts();
    scanPage();

  }, scrollDelay);
}

function stopScraping() {
  scraping = false;
  if (scrollInterval) clearInterval(scrollInterval);
  if (observer) observer.disconnect();
}

// ── Listen for commands from popup ────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_SCRAPE') {
    if (!scraping) {
      foundEmails.clear();
      scrollDelay = message.delay || 2500;
      startScrolling();
      sendResponse({ status: 'started' });
    } else {
      sendResponse({ status: 'already_running' });
    }
  }

  if (message.type === 'STOP_SCRAPE') {
    stopScraping();
    sendResponse({ status: 'stopped', total: foundEmails.size });
  }

  if (message.type === 'GET_STATUS') {
    sendResponse({
      scraping,
      total: foundEmails.size,
      emails: Array.from(foundEmails)
    });
  }

  return true;
});
