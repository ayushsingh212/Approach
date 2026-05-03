// ─── Approach Lead Gen Agent — Background Orchestrator ────────────────────────
// Pipeline: LinkedIn Hiring Posts → Company Names → Google → Website → Email
// TypeScript source. Compile: npm run build

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL: string = "https://approach-two.vercel.app/"; // ✔ matches NEXT_PUBLIC_APP_URL
const API_KEY: string  = "approach-scraper-secret-2024";

// STEP 1: LinkedIn JOBS — all production queries
const LINKEDIN_QUERIES: string[] = [
  "full stack developer intern",
  "frontend developer intern",
  "backend developer intern",
  "react developer intern",
  "next js developer",
  "node js developer",
  "python developer intern",
  "machine learning intern",
  "flutter developer intern",
  "react native developer",
];

// STEP 2: Scroll duration — 5 minutes per page (PRODUCTION)
const SCROLL_DURATION_MS: number = 5 * 60 * 1000;
const MAX_PAGES_PER_QUERY: number = 4; // up to 4 pages × 5 min = 20 min per query

// Alarm config — every 12 hours
const ALARM_NAME: string    = "lead-gen-alarm";
const ALARM_MINUTES: number = 720; // 12 hours

const TAB_LOAD_DELAY_MS: number    = 4000;
const BETWEEN_ACTIONS_DELAY: number = 3000;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScrapedCompany {
  company_name: string;
  role: string;
}

interface Lead {
  company_name: string;
  website: string;
  email: string;
  role?: string;
}

interface StorageData {
  emailStore?: Record<string, Lead>;
  lastAutoScrapeAt?: string;
  companyQueue?: ScrapedCompany[];
}

interface StatusResponse {
  nextAlarmAt: string | null;
  lastAutoScrapeAt: string | null;
  emailCount: number;
  isRunning: boolean;
}

// ─── State ────────────────────────────────────────────────────────────────────

let sessionInProgress: boolean = false;

// ─── Storage ──────────────────────────────────────────────────────────────────

async function getEmailStore(): Promise<Record<string, Lead>> {
  const data = (await chrome.storage.local.get("emailStore")) as StorageData;
  return data.emailStore ?? {};
}

async function saveLead(lead: Lead): Promise<void> {
  const store = await getEmailStore();
  if (!store[lead.email]) {
    store[lead.email] = lead;
    await chrome.storage.local.set({ emailStore: store });
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildLinkedInJobsUrl(query: string, start: number = 0): string {
  const encoded = encodeURIComponent(query);
  // LinkedIn Jobs: Delhi (geoId=102257491), past month (f_TPR=r2592000), sorted by date
  return (
    `https://www.linkedin.com/jobs/search/` +
    `?keywords=${encoded}` +
    `&location=Delhi%2C%20India` +
    `&geoId=102257491` +
    `&f_TPR=r2592000` +
    `&sortBy=DD` +
    `&start=${start}` +
    `&origin=JOB_SEARCH_PAGE_JOB_FILTER`
  );
}

function waitForTabLoad(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError || !tab) { resolve(); return; }
      if (tab.status === "complete") { resolve(); return; }

      const listener = (
        id: number,
        info: chrome.tabs.TabChangeInfo
      ): void => {
        if (id === tabId && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });
  });
}

function closeTab(tabId: number): void {
  chrome.tabs.remove(tabId, () => {
    if (chrome.runtime.lastError) { /* tab already closed */ }
  });
}

// ─── STEP 1+2: LinkedIn Search + Scroll + Company Extraction ─────────────────

interface PageScrapeResult {
  companies: ScrapedCompany[];
  hasNextPage: boolean;
}

function waitForLinkedInScrape(tabId: number): Promise<PageScrapeResult> {
  const SAFETY_TIMEOUT = SCROLL_DURATION_MS + 90_000;

  return new Promise((resolve) => {
    let resolved = false;

    const safetyTimer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        chrome.runtime.onMessage.removeListener(messageListener);
        console.warn(`[Approach] Safety timeout for tab ${tabId}`);
        resolve({ companies: [], hasNextPage: false });
      }
    }, SAFETY_TIMEOUT);

    const messageListener = (
      msg: { type: string; companies?: ScrapedCompany[]; hasNextPage?: boolean },
      sender: chrome.runtime.MessageSender
    ): void => {
      if (
        msg.type === "LINKEDIN_SCRAPE_DONE" &&
        sender.tab?.id === tabId &&
        !resolved
      ) {
        resolved = true;
        clearTimeout(safetyTimer);
        chrome.runtime.onMessage.removeListener(messageListener);
        resolve({
          companies: msg.companies ?? [],
          hasNextPage: msg.hasNextPage ?? false,
        });
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
  });
}

async function scrapeLinkedInQuery(query: string): Promise<ScrapedCompany[]> {
  const allCompanies = new Map<string, ScrapedCompany>();

  for (let page = 0; page < MAX_PAGES_PER_QUERY; page++) {
    const start = page * 25;
    const url = buildLinkedInJobsUrl(query, start);
    console.log(`[Approach] "${query}" — Page ${page + 1} (start=${start})`);

    const tab = await chrome.tabs.create({ url, active: false });
    if (!tab.id) break;

    await waitForTabLoad(tab.id);
    await delay(TAB_LOAD_DELAY_MS);

    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: "START_JOBS_SCRAPE",
        duration: SCROLL_DURATION_MS,
      });
    } catch (err) {
      console.error(`[Approach] Inject failed page ${page + 1}:`, err);
      closeTab(tab.id);
      break;
    }

    const result = await waitForLinkedInScrape(tab.id);
    closeTab(tab.id);

    result.companies.forEach((c) => {
      const key = c.company_name.toLowerCase().trim();
      if (key && isValidCompanyName(c.company_name) && !allCompanies.has(key)) {
        allCompanies.set(key, c);
      }
    });

    console.log(
      `[Approach] Page ${page + 1}: ${result.companies.length} companies | hasNextPage: ${result.hasNextPage}`
    );

    if (!result.hasNextPage) break;
    await delay(3000);
  }

  const total = allCompanies.size;
  console.log(`[Approach] "${query}" total: ${total} unique companies`);
  return Array.from(allCompanies.values());
}

// ─── STEP 5+6+7: Google → Navigate to Website → Crawl for Emails ─────────────
interface CrawlResult {
  websiteUrl: string;
  emails: string[];
}

async function findAndCrawlCompany(
  company: ScrapedCompany
): Promise<CrawlResult> {
  const EMPTY: CrawlResult = { websiteUrl: "", emails: [] };
  const query = `${company.company_name} official website contact email`;
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  const tab = await chrome.tabs.create({ url: searchUrl, active: false });
  if (!tab.id) return EMPTY;

  await waitForTabLoad(tab.id);
  await delay(2500);

  // ── STEP 5: Extract the first valid company website URL from Google ───────
  let websiteUrl: string | null = null;
  try {
    const response = (await chrome.tabs.sendMessage(tab.id, {
      type: "EXTRACT_COMPANY_WEBSITE",
      companyName: company.company_name,
    })) as { domain: string | null } | undefined;
    websiteUrl = response?.domain ?? null;
  } catch (err) {
    console.error(`[Approach] Google parse failed for "${company.company_name}":`, err);
  }

  if (!websiteUrl) {
    console.log(`[Approach] No website found for: ${company.company_name} — skipping`);
    closeTab(tab.id);
    return EMPTY;
  }

  console.log(`[Approach] Navigating to: ${websiteUrl}`);

  // ── STEP 6: Navigate THE SAME TAB to the company website (core bug fix) ───
  await chrome.tabs.update(tab.id, { url: websiteUrl });
  await waitForTabLoad(tab.id);
  await delay(TAB_LOAD_DELAY_MS);

  // ── STEP 7: Crawl the loaded company website for real emails ─────────────
  let emails: string[] = [];
  try {
    const response = (await chrome.tabs.sendMessage(tab.id, {
      type: "CRAWL_WEBSITE_STRICT",
      baseUrl: websiteUrl,
    })) as { emails: string[] } | undefined;
    emails = response?.emails ?? [];
  } catch (err) {
    console.error(`[Approach] Website crawl failed for "${websiteUrl}":`, err);
  } finally {
    closeTab(tab.id);
  }

  if (emails.length > 0) {
    console.log(`[Approach] ✔ Found ${emails.length} email(s) on ${websiteUrl}`);
  } else {
    console.log(`[Approach] No emails on ${websiteUrl} — skipping (strict mode)`);
  }

  return { websiteUrl, emails };
}

// ─── STEP 8+9: Validate + Sync to Backend ────────────────────────────────────

/** Rejects garbage scraped as company names (e.g. '9.6k+', '123', '#1') */
function isValidCompanyName(name: string): boolean {
  const t = name.trim();
  if (t.length < 3) return false;               // too short
  if (!/[a-zA-Z]/.test(t)) return false;        // no letters at all
  if (/^\d/.test(t)) return false;              // starts with digit (9.6k+)
  if (/^[\d.,k+%\s]+$/i.test(t)) return false; // pure count/number string
  return true;
}

async function syncLead(lead: Lead): Promise<void> {
  const payload = {
    email: lead.email,
    companyName: lead.company_name,   // ✔ API expects 'companyName' not 'name'
    website: lead.website,
    jobTitle: lead.role ?? null,
    location: null,
  };

  const send = (): Promise<Response> =>
    fetch(`${BASE_URL}/api/scraper/company`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(payload),
    });

  try {
    const res = await send();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`[Approach] ✔ Saved lead: ${lead.email} (${lead.company_name})`);
  } catch {
    await delay(1500);
    try { await send(); } catch { /* fail silently */ }
  }
}

// ─── Session Orchestrator ─────────────────────────────────────────────────────

async function runSession(): Promise<void> {
  if (sessionInProgress) {
    console.log("[Approach] Session already in progress — skipping.");
    return;
  }

  sessionInProgress = true;
  console.log(
    `[Approach] ═══ Session START — ${LINKEDIN_QUERIES.length} LinkedIn searches ═══`
  );

  try {
    // ── Phase 1: LinkedIn → Companies ────────────────────────────────────────
    const allCompanies = new Map<string, ScrapedCompany>();

    for (const query of LINKEDIN_QUERIES) {
      const companies = await scrapeLinkedInQuery(query);
      companies.forEach((c) => {
        const key = c.company_name.toLowerCase().trim();
        // Skip garbage names like '9.6k+', numbers, empty strings
        if (key && isValidCompanyName(c.company_name) && !allCompanies.has(key)) {
          allCompanies.set(key, c);
        } else if (key && !isValidCompanyName(c.company_name)) {
          console.log(`[Approach] Skipping invalid company name: "${c.company_name}"`);
        }
      });
      await delay(BETWEEN_ACTIONS_DELAY);
    }

    console.log(
      `[Approach] Phase 1 complete — ${allCompanies.size} unique companies`
    );

    // ── Phase 2: Companies → Websites → Emails ────────────────────────────────
    let leadsFound = 0;

    for (const [, company] of allCompanies) {
      // STEPS 5+6+7: Google → navigate to site → crawl for real emails
      const result = await findAndCrawlCompany(company);

      if (!result.websiteUrl || result.emails.length === 0) {
        await delay(BETWEEN_ACTIONS_DELAY);
        continue;
      }

      // STEP 8+9: Save verified leads
      for (const email of result.emails) {
        const lead: Lead = {
          company_name: company.company_name,
          website: result.websiteUrl,
          email,
          role: company.role || undefined,
        };
        await saveLead(lead);
        await syncLead(lead);
        leadsFound++;
      }

      await delay(BETWEEN_ACTIONS_DELAY);
    }

    await chrome.storage.local.set({
      lastAutoScrapeAt: new Date().toISOString(),
    });

    console.log(
      `[Approach] ═══ Session COMPLETE — ${leadsFound} verified leads ═══`
    );
  } catch (err) {
    console.error("[Approach] Session error:", err);
  } finally {
    sessionInProgress = false;
  }
}

// ─── Alarm Setup ──────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (): Promise<void> => {
  await chrome.alarms.clear(ALARM_NAME);
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: ALARM_MINUTES,
    periodInMinutes: ALARM_MINUTES,
  });
  console.log(
    `[Approach] Installed — session runs every ${ALARM_MINUTES / 60}h`
  );
});

chrome.runtime.onStartup.addListener(async (): Promise<void> => {
  const existing = await chrome.alarms.get(ALARM_NAME);
  if (!existing) {
    chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: ALARM_MINUTES,
      periodInMinutes: ALARM_MINUTES,
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm: chrome.alarms.Alarm): void => {
  if (alarm.name === ALARM_NAME) runSession();
});

// ─── Popup Message Listener ───────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (
    message: { type: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ): boolean => {
    switch (message.type) {
      case "RUN_MANUAL":
        sendResponse({ started: true });
        runSession();
        return false;

      case "GET_STATUS": {
        Promise.all([
          chrome.alarms.get(ALARM_NAME),
          chrome.storage.local.get([
            "lastAutoScrapeAt",
            "emailStore",
          ]) as Promise<StorageData>,
        ]).then(([alarm, stored]) => {
          const response: StatusResponse = {
            nextAlarmAt: alarm
              ? new Date(alarm.scheduledTime).toISOString()
              : null,
            lastAutoScrapeAt: stored.lastAutoScrapeAt ?? null,
            emailCount: Object.keys(stored.emailStore ?? {}).length,
            isRunning: sessionInProgress,
          };
          sendResponse(response);
        });
        return true;
      }

      case "CLEAR_DATA":
        chrome.storage.local
          .set({ emailStore: {}, companyQueue: [] })
          .then(() => sendResponse({ success: true }));
        return true;

      default:
        sendResponse({});
        return false;
    }
  }
);
