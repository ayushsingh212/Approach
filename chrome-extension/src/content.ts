// ─── Approach Lead Gen Agent — Content Script ─────────────────────────────────
// Phase 1: Direct LinkedIn DOM scan for emails (fast — from reference scraper)
// Phase 2: Google SERP parsing → company website → strict email crawl
// TypeScript source. Compile: npm run build

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScrapedCompany {
  company_name: string;
  role: string;
}

type IncomingMessage =
  | { type: "START_JOBS_SCRAPE"; duration: number }
  | { type: "START_LINKEDIN_EMAIL_SCAN"; delay?: number }
  | { type: "STOP_LINKEDIN_EMAIL_SCAN" }
  | { type: "GET_SCAN_STATUS" }
  | { type: "EXTRACT_COMPANY_WEBSITE"; companyName: string }
  | { type: "CRAWL_WEBSITE_STRICT"; baseUrl: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const OBFUSCATED_EMAIL_REGEX =
  /[a-zA-Z0-9._%+\-]+\s?\[at\]\s?[a-zA-Z0-9.\-]+\s?\[dot\]\s?[a-zA-Z]{2,}/gi;

const IGNORED_EMAIL_DOMAINS: string[] = [
  "example.com", "sentry.io", "wixpress.com", "amazonaws.com",
  "cloudfront.net", "linkedin.com", "google.com", "googlemail.com",
  "w3.org", "schema.org", "facebook.com", "twitter.com",
  "2x.png", "sentry", "wixpress",
];

const PORTAL_DOMAINS: string[] = [
  "linkedin.com", "indeed.com", "naukri.com", "glassdoor.com",
  "simplyhired.com", "monster.com", "ziprecruiter.com", "facebook.com",
  "twitter.com", "instagram.com", "youtube.com", "reddit.com",
  "wikipedia.org", "medium.com", "crunchbase.com", "clutch.co",
  "goodfirms.co", "ambitionbox.com", "internshala.com",
];

const PRIORITY_PATHS: string[] = [
  "/contact", "/contact-us", "/about", "/about-us",
  "/careers", "/team", "/hire", "/reach-us", "/get-in-touch",
];

// ─── LinkedIn Jobs Page Selectors ─────────────────────────────────────────────

const JOBS_LIST_SELECTOR = [
  ".jobs-search-results-list",
  ".scaffold-layout__list-container",
  ".jobs-search__results-list",
].join(", ");

const JOB_CARD_SELECTOR = [
  ".jobs-search-results__list-item",
  ".job-card-container",
  "li[data-occludable-job-id]",
].join(", ");

const COMPANY_NAME_SELECTORS = [
  ".job-card-container__company-name",
  ".artdeco-entity-lockup__subtitle span",
  ".job-card-list__entity-lockup .artdeco-entity-lockup__subtitle",
  "[data-tracking-control-name='public_jobs_jserp-result_job-search-card-subtitle']",
  ".base-search-card__subtitle",
];

const JOB_TITLE_SELECTORS = [
  ".job-card-list__title",
  ".job-card-container__link span",
  ".base-card__full-link span",
];

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 1: DIRECT LINKEDIN DOM EMAIL SCAN
// ═══════════════════════════════════════════════════════════════════════════════

let scanning = false;
let foundEmails = new Set<string>();
let scrollInterval: ReturnType<typeof setInterval> | null = null;
let domObserver: MutationObserver | null = null;
let noNewContentCount = 0;
let lastScrollY = -1;

/** Filter out common false positives from regex matches */
function filterEmailFalsePositives(emails: string[]): string[] {
  return emails.filter((email) => {
    const lower = email.toLowerCase();
    return (
      !lower.endsWith(".png") &&
      !lower.endsWith(".jpg") &&
      !lower.endsWith(".jpeg") &&
      !lower.endsWith(".gif") &&
      !lower.endsWith(".svg") &&
      !lower.includes("sentry") &&
      !lower.includes("example.com") &&
      !lower.includes("wixpress") &&
      !lower.includes("@2x") &&
      !lower.includes("linkedin.com")
    );
  });
}

/** Scan visible DOM text for emails and send each new one to background */
function scanLinkedInPage(): void {
  const bodyText = document.body?.innerText ?? "";
  const raw = bodyText.match(EMAIL_REGEX) ?? [];
  const emails = filterEmailFalsePositives(raw);

  emails.forEach((email) => {
    const normalized = email.toLowerCase().trim();
    if (!foundEmails.has(normalized)) {
      foundEmails.add(normalized);
      chrome.runtime.sendMessage({ type: "EMAIL_FOUND", email: normalized });
    }
  });
}

/** Click "see more" / "show more" buttons to expand hidden text */
function expandLinkedInPosts(): void {
  const selectors = [
    "button.feed-shared-inline-show-more-text__see-more-less-toggle",
    "button[aria-label='see more']",
    ".see-more-less-html__button",
    "button.inline-show-more-text__button",
    "[data-control-name='see_more']",
  ];
  selectors.forEach((sel) => {
    document.querySelectorAll<HTMLElement>(sel).forEach((btn) => {
      try { btn.click(); } catch { /* ignore */ }
    });
  });
}

/** Start the scroll + scan loop on the current LinkedIn page */
function startLinkedInEmailScan(scrollDelay = 2500): void {
  if (scanning) return;
  scanning = true;
  foundEmails.clear();
  noNewContentCount = 0;
  lastScrollY = -1;

  // Watch DOM mutations (new posts loading)
  domObserver = new MutationObserver(() => {
    expandLinkedInPosts();
    scanLinkedInPage();
  });
  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Initial pass
  expandLinkedInPosts();
  scanLinkedInPage();

  // Scroll loop
  scrollInterval = setInterval(() => {
    if (!scanning) {
      clearInterval(scrollInterval!);
      return;
    }

    const currentY = window.scrollY;

    if (Math.abs(currentY - lastScrollY) < 5 && lastScrollY !== -1) {
      noNewContentCount++;
      if (noNewContentCount >= 4) {
        // Try "Load more" buttons
        const loadMoreSelectors = [
          "button.scaffold-finite-scroll__load-button",
          "button[aria-label='Load more results']",
          ".artdeco-pagination__button--next",
          "button.see-more-jobs",
        ];
        let clicked = false;
        for (const sel of loadMoreSelectors) {
          const btn = document.querySelector<HTMLElement>(sel);
          if (btn) {
            btn.click();
            clicked = true;
            noNewContentCount = 0;
            break;
          }
        }
        if (!clicked && noNewContentCount >= 8) {
          stopLinkedInEmailScan();
          chrome.runtime.sendMessage({
            type: "SCRAPE_DONE",
            total: foundEmails.size,
          });
          return;
        }
      }
    } else {
      noNewContentCount = 0;
    }

    lastScrollY = currentY;
    window.scrollBy({ top: 800, behavior: "smooth" });
    expandLinkedInPosts();
    scanLinkedInPage();
  }, scrollDelay);
}

function stopLinkedInEmailScan(): void {
  scanning = false;
  if (scrollInterval) clearInterval(scrollInterval);
  if (domObserver) domObserver.disconnect();
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 2: LINKEDIN JOBS → COMPANIES (existing pipeline, kept intact)
// ═══════════════════════════════════════════════════════════════════════════════

function extractCompaniesFromJobCards(
  accumulator: Map<string, ScrapedCompany>
): void {
  const cards = document.querySelectorAll<HTMLElement>(JOB_CARD_SELECTOR);

  cards.forEach((card) => {
    let companyName = "";
    for (const sel of COMPANY_NAME_SELECTORS) {
      const el = card.querySelector<HTMLElement>(sel);
      const text = el?.textContent?.trim();
      if (text && text.length > 1) { companyName = text; break; }
    }

    let role = "";
    for (const sel of JOB_TITLE_SELECTORS) {
      const el = card.querySelector<HTMLElement>(sel);
      const text = el?.textContent?.trim();
      if (text) { role = text; break; }
    }

    if (!companyName) return;
    const key = companyName.toLowerCase().trim();
    if (!accumulator.has(key)) {
      accumulator.set(key, { company_name: companyName, role });
    }
  });
}

function detectNextPage(): boolean {
  const selectors = [
    "button[aria-label='View next page']",
    "button.jobs-search-pagination__button--next",
    "li[data-test-pagination-page-btn='next'] button",
    ".artdeco-pagination__button--next",
  ];
  for (const sel of selectors) {
    const btn = document.querySelector<HTMLElement>(sel);
    if (btn && !btn.hasAttribute("disabled") && btn.offsetParent !== null) return true;
  }
  const allButtons = Array.from(document.querySelectorAll<HTMLElement>("button, a"));
  return allButtons.some(
    (el) =>
      /^\s*next\s*$/i.test(el.textContent ?? "") &&
      el.offsetParent !== null &&
      !el.hasAttribute("disabled")
  );
}

function startJobsScrape(duration: number): void {
  const companies = new Map<string, ScrapedCompany>();
  const INTERVAL_MS = 3000;
  let elapsed = 0;

  extractCompaniesFromJobCards(companies);

  const interval = setInterval(() => {
    const listPanel = document.querySelector<HTMLElement>(JOBS_LIST_SELECTOR);
    if (listPanel) {
      listPanel.scrollBy({ top: 700, behavior: "smooth" });
    } else {
      window.scrollBy({ top: 700, behavior: "smooth" });
    }

    // Phase 1: Direct extraction (scans for emails in job descriptions/cards)
    expandLinkedInPosts();
    scanLinkedInPage();

    // Phase 2: Company discovery
    extractCompaniesFromJobCards(companies);

    elapsed += INTERVAL_MS;

    if (elapsed >= duration) {
      clearInterval(interval);
      const results = Array.from(companies.values());
      const hasNextPage = detectNextPage();

      chrome.runtime.sendMessage({
        type: "LINKEDIN_SCRAPE_DONE",
        companies: results,
        hasNextPage,
      });
    }
  }, INTERVAL_MS);
}

// ─── Google SERP → Company Website ───────────────────────────────────────────

function extractCompanyWebsite(companyName: string): string | null {
  const companyTokens = companyName
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const citeEls = Array.from(document.querySelectorAll<HTMLElement>("cite"));
  for (const cite of citeEls) {
    const raw = cite.textContent?.trim() ?? "";
    const domainRaw = raw.split("›")[0].trim().split(" ")[0].trim();
    if (!domainRaw || !domainRaw.includes(".")) continue;
    const isPortal = PORTAL_DOMAINS.some((d) => domainRaw.includes(d));
    if (isPortal) continue;
    const fullUrl = domainRaw.startsWith("http") ? domainRaw : `https://${domainRaw}`;
    try {
      const parsed = new URL(fullUrl);
      return `${parsed.protocol}//${parsed.hostname}`;
    } catch { continue; }
  }

  const searchArea =
    document.querySelector<HTMLElement>("#search, #rso") ?? document.body;
  const anchors = Array.from(
    searchArea.querySelectorAll<HTMLAnchorElement>("a[href]")
  );

  for (const anchor of anchors) {
    let resolvedHref = anchor.href;
    if (resolvedHref.includes("google.") && resolvedHref.includes("/url?")) {
      const match = resolvedHref.match(/[?&]q=([^&]+)/);
      if (match?.[1]) {
        const decoded = decodeURIComponent(match[1]);
        if (decoded.startsWith("http")) { resolvedHref = decoded; }
        else { continue; }
      } else { continue; }
    }
    if (resolvedHref.includes("google.")) continue;
    if (resolvedHref.includes("/search?")) continue;
    if (!resolvedHref.startsWith("http")) continue;
    const isPortal = PORTAL_DOMAINS.some((d) => resolvedHref.includes(d));
    if (isPortal) continue;

    const context = (
      anchor.closest("div")?.textContent ?? anchor.textContent ?? ""
    ).toLowerCase();
    const isRelevant =
      companyTokens.length === 0 ||
      companyTokens.some(
        (t) => resolvedHref.toLowerCase().includes(t) || context.includes(t)
      );
    if (!isRelevant) continue;

    try {
      const url = new URL(resolvedHref);
      return `${url.protocol}//${url.hostname}`;
    } catch { continue; }
  }

  return null;
}

// ─── Website Strict Email Crawl ───────────────────────────────────────────────

function isValidEmail(email: string, companyDomain?: string): boolean {
  const lower = email.toLowerCase();
  if (IGNORED_EMAIL_DOMAINS.some((d) => lower.includes(`@${d}`))) return false;
  if (/\.(png|jpg|jpeg|gif|svg|webp|css|js|ts|woff)$/i.test(lower)) return false;
  if (companyDomain) {
    const emailDomain = lower.split("@")[1] ?? "";
    if (!emailDomain.includes(companyDomain)) return false;
  }
  return true;
}

function extractEmailsStrict(text: string, companyDomain?: string): string[] {
  const emails: string[] = [];
  (text.match(EMAIL_REGEX) ?? []).forEach((e) => emails.push(e));
  (text.match(OBFUSCATED_EMAIL_REGEX) ?? []).forEach((obs) => {
    emails.push(obs.replace(/\[at\]/gi, "@").replace(/\[dot\]/gi, ".").replace(/\s/g, ""));
  });
  return Array.from(new Set(emails))
    .map((e) => e.toLowerCase().trim())
    .filter((e) => isValidEmail(e, companyDomain));
}

async function crawlWebsiteStrict(baseUrl: string): Promise<string[]> {
  let companyDomain = "";
  try {
    companyDomain = new URL(baseUrl).hostname.replace("www.", "");
  } catch { return []; }

  const allEmails = new Set<string>();

  const bodyText = document.body?.innerText ?? "";
  extractEmailsStrict(bodyText, companyDomain).forEach((e) => allEmails.add(e));

  document
    .querySelectorAll<HTMLAnchorElement>("a[href^='mailto:']")
    .forEach((a) => {
      const email = a.href.replace("mailto:", "").split("?")[0].toLowerCase().trim();
      if (isValidEmail(email, companyDomain)) allEmails.add(email);
    });

  const footer = document.querySelector<HTMLElement>(
    "footer, #footer, .footer, [class*='footer']"
  );
  if (footer) {
    extractEmailsStrict(footer.innerText ?? "", companyDomain).forEach((e) =>
      allEmails.add(e)
    );
  }

  if (allEmails.size > 0) return Array.from(allEmails);

  const pageLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("a[href]")
  )
    .map((a) => a.href)
    .filter((href) => {
      try {
        const url = new URL(href);
        return (
          url.hostname.includes(companyDomain) &&
          PRIORITY_PATHS.some((p) => url.pathname.toLowerCase().includes(p.slice(1)))
        );
      } catch { return false; }
    });

  const subPageUrls = Array.from(
    new Set([
      ...PRIORITY_PATHS.map((p) => `${baseUrl.replace(/\/$/, "")}${p}`),
      ...pageLinks,
    ])
  ).slice(0, 4);

  for (const subUrl of subPageUrls) {
    try {
      const res = await fetch(subUrl, {
        credentials: "omit",
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      extractEmailsStrict(html, companyDomain).forEach((e) => allEmails.add(e));
      if (allEmails.size > 0) break;
    } catch { /* continue */ }
  }

  return Array.from(allEmails);
}

// ─── Message Router ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (
    message: IncomingMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ): boolean => {

    // ── PHASE 1: Direct LinkedIn email scan ───────────────────────────────────
    if (message.type === "START_LINKEDIN_EMAIL_SCAN") {
      if (!scanning) {
        startLinkedInEmailScan(message.delay ?? 2500);
        sendResponse({ status: "started" });
      } else {
        sendResponse({ status: "already_running" });
      }
      return false;
    }

    if (message.type === "STOP_LINKEDIN_EMAIL_SCAN") {
      stopLinkedInEmailScan();
      sendResponse({ status: "stopped", total: foundEmails.size });
      return false;
    }

    if (message.type === "GET_SCAN_STATUS") {
      sendResponse({
        scanning,
        total: foundEmails.size,
        emails: Array.from(foundEmails),
      });
      return false;
    }

    // ── PHASE 2: Company pipeline ─────────────────────────────────────────────
    if (message.type === "START_JOBS_SCRAPE") {
      startJobsScrape(message.duration);
      sendResponse({ started: true });
      return false;
    }

    if (message.type === "EXTRACT_COMPANY_WEBSITE") {
      const domain = extractCompanyWebsite(message.companyName);
      sendResponse({ domain });
      return false;
    }

    if (message.type === "CRAWL_WEBSITE_STRICT") {
      crawlWebsiteStrict(message.baseUrl).then((emails) => {
        sendResponse({ emails });
      });
      return true; // async
    }

    return false;
  }
);
