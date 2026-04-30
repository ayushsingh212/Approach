// ─── LinkedIn Email Scraper — content.js ─────────────────────────────────────
// Injected into LinkedIn pages.
// Extracts emails + surrounding company context from the DOM,
// auto-scrolls, expands "See more" buttons, and deduplicates.

// ─── Config ───────────────────────────────────────────────────────────────────

const SCROLL_SPEEDS = { SAFE: 4000, NORMAL: 2500, FAST: 1200 };
let scrollInterval = null;
let scrollSpeed    = SCROLL_SPEEDS.NORMAL;
let isRunning      = false;

// Already-found emails (dedup within this tab session)
const foundEmails = new Set();

// ─── Email regex ──────────────────────────────────────────────────────────────

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

// False-positive filters
const IGNORED_DOMAINS = [
  'example.com', 'sentry.io', 'wixpress.com', 'amazonaws.com',
  'cloudfront.net', 'linkedin.com', 'licdn.com',
];
const IGNORED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.css', '.js'];

function isValidEmail(email) {
  const lower = email.toLowerCase();
  if (IGNORED_EXTENSIONS.some((ext) => lower.endsWith(ext))) return false;
  if (IGNORED_DOMAINS.some((d) => lower.endsWith('@' + d) || lower.includes('@' + d + '.'))) return false;
  return true;
}

// ─── DOM context extraction ───────────────────────────────────────────────────

/**
 * Given an element that contains the email text, walk up the DOM to find
 * the nearest LinkedIn result card, then extract company context from it.
 */
function extractContext(emailEl) {
  const CARD_SELECTORS = [
    '.entity-result__item',
    '.reusable-search__result-container',
    '.feed-shared-update-v2',
    '.profile-result',
  ];

  let card = null;
  let el = emailEl;

  while (el && el !== document.body) {
    for (const sel of CARD_SELECTORS) {
      if (el.matches && el.matches(sel)) { card = el; break; }
    }
    if (card) break;
    el = el.parentElement;
  }

  if (!card) return { companyName: null, jobTitle: null, location: null, website: null };

  // ── companyName ────────────────────────────────────────────────────────────
  let companyName = null;

  const subtitleEls = card.querySelectorAll(
    '.entity-result__primary-subtitle, .entity-result__secondary-subtitle',
  );
  for (const subEl of subtitleEls) {
    const text = subEl.textContent?.trim() ?? '';
    const atMatch = text.match(/\bat\s+(.+)$/i);
    if (atMatch) { companyName = atMatch[1].trim(); break; }
    if (
      subEl.classList.contains('entity-result__secondary-subtitle') &&
      text.length > 0
    ) {
      companyName = text;
    }
  }

  // ── jobTitle ───────────────────────────────────────────────────────────────
  let jobTitle = null;
  const primarySub = card.querySelector('.entity-result__primary-subtitle');
  if (primarySub) {
    const text = primarySub.textContent?.trim() ?? '';
    jobTitle = text.replace(/\bat\s+.+$/i, '').trim() || text;
  }

  // ── location ──────────────────────────────────────────────────────────────
  let location = null;
  const tertiaryEl = card.querySelector('.entity-result__tertiary-subtitle');
  if (tertiaryEl) {
    location = tertiaryEl.textContent?.trim() || null;
  }

  // ── website (first non-LinkedIn external link in the card) ─────────────────
  let website = null;
  const links = card.querySelectorAll('a[href]');
  for (const link of links) {
    const href = link.getAttribute('href') ?? '';
    if (
      href.startsWith('http') &&
      !href.includes('linkedin.com') &&
      !href.includes('licdn.com')
    ) {
      website = href;
      break;
    }
  }

  return { companyName, jobTitle, location, website };
}

// ─── Scan visible page text for emails ───────────────────────────────────────

function scanForEmails() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
  );

  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent ?? '';
    const matches = text.match(EMAIL_REGEX);
    if (!matches) continue;

    for (const raw of matches) {
      const email = raw.toLowerCase();
      if (!isValidEmail(email)) continue;
      if (foundEmails.has(email)) continue;

      foundEmails.add(email);

      const parentEl = node.parentElement ?? document.body;
      const { companyName, jobTitle, location, website } = extractContext(parentEl);

      chrome.runtime.sendMessage({
        type: 'EMAIL_FOUND',
        email,
        companyName,
        jobTitle,
        location,
        website,
      });
    }
  }
}

// ─── Expand "See more" buttons ───────────────────────────────────────────────

function clickSeeMoreButtons() {
  const buttons = document.querySelectorAll(
    'button.inline-show-more-text__button, ' +
    'button[aria-label*="see more"], ' +
    'span.see-more, ' +
    '.feed-shared-inline-show-more-text__see-more-less-toggle',
  );
  buttons.forEach((btn) => {
    try { btn.click(); } catch { /* ignore */ }
  });
}

// ─── Auto-scroll ─────────────────────────────────────────────────────────────

function startScrolling() {
  if (scrollInterval) return;

  scrollInterval = setInterval(() => {
    if (!isRunning) { stopScrolling(); return; }

    clickSeeMoreButtons();
    scanForEmails();
    window.scrollBy({ top: 600, behavior: 'smooth' });

    const scrolledToBottom =
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 100;

    if (scrolledToBottom) {
      stopScrolling();
      // BUG FIX: delay SCRAPE_DONE so all pending EMAIL_FOUND messages in
      // the background listener queue are processed first before bulk sync.
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'SCRAPE_DONE' });
      }, 800);
    }
  }, scrollSpeed);
}

function stopScrolling() {
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
  isRunning = false;
}

// ─── Message listener (from popup.js via chrome.tabs.sendMessage) ─────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // Only handle messages intended for the content script.
  // background.js handles EMAIL_FOUND / SCRAPE_DONE itself — ignore them here.
  if (message.type === 'START_SCRAPING') {
    if (message.speed && SCROLL_SPEEDS[message.speed]) {
      scrollSpeed = SCROLL_SPEEDS[message.speed];
    }
    isRunning = true;
    scanForEmails(); // immediate first pass before auto-scroll kicks in
    startScrolling();
    sendResponse({ success: true });
    return false; // synchronous response — do NOT keep channel open
  }

  if (message.type === 'STOP_SCRAPING') {
    stopScrolling();
    // BUG FIX: delay so the last batch of EMAIL_FOUND messages are processed
    // by background.js before the bulk sync fires via SCRAPE_DONE.
    setTimeout(() => {
      chrome.runtime.sendMessage({ type: 'SCRAPE_DONE' });
    }, 800);
    sendResponse({ success: true });
    return false;
  }

  // Unknown message — do not respond (avoids "message channel closed" warnings)
  return false;
});
