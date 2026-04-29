// ─── Config ───────────────────────────────────────────────────────────────────
// ⚠️  PRODUCTION CHECKLIST (before publishing the extension):
//   1. Change BASE_URL to your live domain, e.g. 'https://approach.yourdomain.com'
//   2. Change API_KEY to match SCRAPER_API_KEY in your production .env
//   3. Add the production origin to host_permissions in manifest.json
const BASE_URL = 'http://localhost:3000';
const API_KEY  = 'approach-scraper-secret-2024'; // Must match SCRAPER_API_KEY in .env

// ─── In-memory store: keyed by email → full enriched record ──────────────────
// Each entry: { email, companyName, jobTitle, location, website }
const emailStore = new Map();

// ─── Backend sync helpers ─────────────────────────────────────────────────────

/**
 * POST a single enriched record to /api/scraper/company.
 * Silent — never throws. Retries once on failure.
 */
async function syncSingleRecord(record) {
  const send = () =>
    fetch(`${BASE_URL}/api/scraper/company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(record),
    });

  try {
    const res = await send();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    // One silent retry after 1.5s
    await new Promise((r) => setTimeout(r, 1500));
    try { await send(); } catch { /* fail silently — never break the extension */ }
  }
}

/**
 * POST the full store to /api/scraper/bulk on SCRAPE_DONE.
 * Silent — never throws. Retries once on failure.
 * The bulk endpoint handles duplicates with ordered:false — safe to call
 * even if records were already sent individually via syncSingleRecord.
 */
async function syncBulkRecords() {
  const records = [...emailStore.values()];
  if (records.length === 0) return;

  const payload = {
    records,
    completedAt: new Date().toISOString(),
  };

  const send = () =>
    fetch(`${BASE_URL}/api/scraper/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(payload),
    });

  try {
    const res = await send();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    await new Promise((r) => setTimeout(r, 1500));
    try { await send(); } catch { /* fail silently */ }
  }
}

// ─── Message listener ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {

    // ── Single enriched email found ───────────────────────────────────────────
    case 'EMAIL_FOUND': {
      const { email, companyName, jobTitle, location, website } = message;
      if (!email || emailStore.has(email)) {
        // BUG FIX: must still call sendResponse to close the channel cleanly
        sendResponse({});
        return false;
      }

      const record = { email, companyName, jobTitle, location, website };
      emailStore.set(email, record);

      // BUG FIX: respond immediately (synchronous), THEN fire the async sync.
      // This prevents "message channel closed before response" errors in MV3.
      sendResponse({ queued: true });
      syncSingleRecord(record); // fire-and-forget
      return false; // do NOT keep channel open — response already sent above
    }

    // ── Scraping finished — sync full batch ───────────────────────────────────
    case 'SCRAPE_DONE': {
      // BUG FIX: respond immediately, THEN run the async bulk sync.
      sendResponse({});
      syncBulkRecords(); // fire-and-forget
      return false;
    }

    // ── Popup requests all stored emails (for display / local CSV export) ─────
    case 'GET_ALL_EMAILS': {
      sendResponse({ emails: [...emailStore.keys()] });
      return false;
    }

    // ── Clear local store ─────────────────────────────────────────────────────
    case 'CLEAR_EMAILS': {
      emailStore.clear();
      sendResponse({ success: true });
      return false;
    }

    default:
      sendResponse({});
      return false;
  }
});
