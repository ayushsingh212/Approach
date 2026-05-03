// ─── Approach Lead Gen Agent — Content Script ─────────────────────────────────
// Handles: LinkedIn Jobs scraping, Google parsing, Company website crawling
// TypeScript source. Compile: npm run build

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScrapedCompany {
  company_name: string;
  role: string;
}

type IncomingMessage =
  | { type: "START_JOBS_SCRAPE"; duration: number }
  | { type: "EXTRACT_COMPANY_WEBSITE"; companyName: string }
  | { type: "CRAWL_WEBSITE_STRICT"; baseUrl: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const OBFUSCATED_EMAIL_REGEX =
  /[a-zA-Z0-9._%+\-]+\s?\[at\]\s?[a-zA-Z0-9.\-]+\s?\[dot\]\s?[a-zA-Z]{2,}/gi;

// Domains to reject in email validation
const IGNORED_EMAIL_DOMAINS: string[] = [
  "example.com", "sentry.io", "wixpress.com", "amazonaws.com",
  "cloudfront.net", "linkedin.com", "google.com", "googlemail.com",
  "w3.org", "schema.org", "facebook.com", "twitter.com",
];

// Domains to skip in Google results
const PORTAL_DOMAINS: string[] = [
  "linkedin.com", "indeed.com", "naukri.com", "glassdoor.com",
  "simplyhired.com", "monster.com", "ziprecruiter.com", "facebook.com",
  "twitter.com", "instagram.com", "youtube.com", "reddit.com",
  "wikipedia.org", "medium.com", "crunchbase.com", "clutch.co",
  "goodfirms.co", "ambitionbox.com", "internshala.com",
];

// Priority sub-pages for email crawl
const PRIORITY_PATHS: string[] = [
  "/contact", "/contact-us", "/about", "/about-us",
  "/careers", "/team", "/hire", "/reach-us", "/get-in-touch",
];

// ─── LinkedIn Jobs Page Selectors ─────────────────────────────────────────────

// Scrollable left panel containing job cards
const JOBS_LIST_SELECTOR = [
  ".jobs-search-results-list",
  ".scaffold-layout__list-container",
  ".jobs-search__results-list",
].join(", ");

// Individual job card items
const JOB_CARD_SELECTOR = [
  ".jobs-search-results__list-item",
  ".job-card-container",
  "li[data-occludable-job-id]",
].join(", ");

// Company name inside a job card
const COMPANY_NAME_SELECTORS = [
  ".job-card-container__company-name",
  ".artdeco-entity-lockup__subtitle span",
  ".job-card-list__entity-lockup .artdeco-entity-lockup__subtitle",
  "[data-tracking-control-name='public_jobs_jserp-result_job-search-card-subtitle']",
  ".base-search-card__subtitle",
];

// Job title inside a card
const JOB_TITLE_SELECTORS = [
  ".job-card-list__title",
  ".job-card-container__link span",
  ".base-card__full-link span",
];

// ─── STEP 4: Extract Companies from LinkedIn Jobs Page ────────────────────────

function extractCompaniesFromJobCards(
  accumulator: Map<string, ScrapedCompany>
): void {
  const cards = document.querySelectorAll<HTMLElement>(JOB_CARD_SELECTOR);

  cards.forEach((card) => {
    // Get company name
    let companyName = "";
    for (const sel of COMPANY_NAME_SELECTORS) {
      const el = card.querySelector<HTMLElement>(sel);
      const text = el?.textContent?.trim();
      if (text && text.length > 1) {
        companyName = text;
        break;
      }
    }

    // Get job title
    let role = "";
    for (const sel of JOB_TITLE_SELECTORS) {
      const el = card.querySelector<HTMLElement>(sel);
      const text = el?.textContent?.trim();
      if (text) { role = text; break; }
    }

    if (!companyName) return;

    const key = companyName.toLowerCase().trim();
    if (!accumulator.has(key)) {
      console.log(`[Approach Content] Found company: "${companyName}" — ${role}`);
      accumulator.set(key, { company_name: companyName, role });
    }
  });
}

// ─── STEP 2: Scroll Left Panel + Collect Companies ────────────────────────────

function detectNextPage(): boolean {
  // LinkedIn Jobs pagination: "Next" button at bottom of left panel
  const selectors = [
    "button[aria-label='View next page']",
    "button.jobs-search-pagination__button--next",
    "li[data-test-pagination-page-btn='next'] button",
    ".artdeco-pagination__button--next",
  ];
  for (const sel of selectors) {
    const btn = document.querySelector<HTMLElement>(sel);
    if (btn && !btn.hasAttribute("disabled") && btn.offsetParent !== null) {
      return true;
    }
  }
  // Fallback: look for any visible element with text "Next"
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

  // First pass immediately
  extractCompaniesFromJobCards(companies);

  const interval = setInterval(() => {
    // Scroll the left panel (job list), not the whole window
    const listPanel = document.querySelector<HTMLElement>(JOBS_LIST_SELECTOR);
    if (listPanel) {
      listPanel.scrollBy({ top: 700, behavior: "smooth" });
    } else {
      window.scrollBy({ top: 700, behavior: "smooth" });
    }

    // Extract after scroll to catch newly loaded cards
    extractCompaniesFromJobCards(companies);
    elapsed += INTERVAL_MS;

    if (elapsed >= duration) {
      clearInterval(interval);
      const results = Array.from(companies.values());
      const hasNextPage = detectNextPage();
      console.log(
        `[Approach Content] Jobs scrape done — ${results.length} companies | hasNextPage: ${hasNextPage}`
      );

      chrome.runtime.sendMessage({
        type: "LINKEDIN_SCRAPE_DONE",
        companies: results,
        hasNextPage,
      });
    }
  }, INTERVAL_MS);
}

// ─── STEP 5: Extract Company Website from Google Results ─────────────────────

function extractCompanyWebsite(companyName: string): string | null {
  const companyTokens = companyName
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  // ── Strategy 1: Google <cite> elements show the real domain plainly ──────────────
  // e.g. <cite>zenithbyteinnovations.com › contact</cite>
  // These are NOT redirect URLs — they are the raw domains.
  const citeEls = Array.from(document.querySelectorAll<HTMLElement>("cite"));
  for (const cite of citeEls) {
    const raw = cite.textContent?.trim() ?? "";
    // Take the part before any "›" breadcrumb
    const domainRaw = raw.split("›")[0].trim().split(" ")[0].trim();
    if (!domainRaw || !domainRaw.includes(".")) continue;

    const isPortal = PORTAL_DOMAINS.some((d) => domainRaw.includes(d));
    if (isPortal) continue;

    const fullUrl = domainRaw.startsWith("http")
      ? domainRaw
      : `https://${domainRaw}`;

    try {
      const parsed = new URL(fullUrl);
      const domain = `${parsed.protocol}//${parsed.hostname}`;
      console.log(`[Approach] ✔ cite strategy → ${domain}`);
      return domain;
    } catch {
      continue;
    }
  }

  // ── Strategy 2: Unwrap Google redirect URLs (/url?q=https://...) ─────────
  // Google wraps result links like: https://www.google.com/url?q=https://company.com
  // Our old code had `href.includes("google.") → skip` which blocked these!
  const searchArea =
    document.querySelector<HTMLElement>("#search, #rso") ?? document.body;
  const anchors = Array.from(
    searchArea.querySelectorAll<HTMLAnchorElement>("a[href]")
  );

  for (const anchor of anchors) {
    let resolvedHref = anchor.href;

    // Unwrap Google's redirect format
    if (resolvedHref.includes("google.") && resolvedHref.includes("/url?")) {
      const match = resolvedHref.match(/[?&]q=([^&]+)/);
      if (match?.[1]) {
        const decoded = decodeURIComponent(match[1]);
        if (decoded.startsWith("http")) {
          resolvedHref = decoded; // now it's the real URL
        } else {
          continue;
        }
      } else {
        continue;
      }
    }

    // Skip all remaining Google-internal links
    if (resolvedHref.includes("google.")) continue;
    if (resolvedHref.includes("/search?")) continue;
    if (!resolvedHref.startsWith("http")) continue;

    const isPortal = PORTAL_DOMAINS.some((d) => resolvedHref.includes(d));
    if (isPortal) continue;

    // Relevance: company name tokens should appear in URL or surrounding text
    const context = (
      anchor.closest("div")?.textContent ??
      anchor.textContent ??
      ""
    ).toLowerCase();

    const isRelevant =
      companyTokens.length === 0 ||
      companyTokens.some(
        (t) =>
          resolvedHref.toLowerCase().includes(t) || context.includes(t)
      );
    if (!isRelevant) continue;

    try {
      const url = new URL(resolvedHref);
      const domain = `${url.protocol}//${url.hostname}`;
      console.log(`[Approach] ✔ redirect-unwrap strategy → ${domain}`);
      return domain;
    } catch {
      continue;
    }
  }

  console.warn(`[Approach] Could not find website for: ${companyName}`);
  return null;
}

// ─── STEP 7: Strict Email Extraction ─────────────────────────────────────────

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

  // Standard regex
  (text.match(EMAIL_REGEX) ?? []).forEach((e) => emails.push(e));

  // Obfuscated: name [at] domain [dot] com
  (text.match(OBFUSCATED_EMAIL_REGEX) ?? []).forEach((obs) => {
    emails.push(
      obs.replace(/\[at\]/gi, "@").replace(/\[dot\]/gi, ".").replace(/\s/g, "")
    );
  });

  return Array.from(new Set(emails))
    .map((e) => e.toLowerCase().trim())
    .filter((e) => isValidEmail(e, companyDomain));
}

// ─── STEP 6+7: Website Crawl (Strict Mode) ────────────────────────────────────

async function crawlWebsiteStrict(baseUrl: string): Promise<string[]> {
  let companyDomain = "";
  try {
    companyDomain = new URL(baseUrl).hostname.replace("www.", "");
  } catch {
    return [];
  }

  const allEmails = new Set<string>();

  // Layer 1a: Full body text
  const bodyText = document.body?.innerText ?? "";
  extractEmailsStrict(bodyText, companyDomain).forEach((e) => allEmails.add(e));

  // Layer 1b: Mailto links (highest confidence)
  document
    .querySelectorAll<HTMLAnchorElement>("a[href^='mailto:']")
    .forEach((a) => {
      const email = a.href.replace("mailto:", "").split("?")[0].toLowerCase().trim();
      if (isValidEmail(email, companyDomain)) allEmails.add(email);
    });

  // Layer 1c: Footer element
  const footer = document.querySelector<HTMLElement>(
    "footer, #footer, .footer, [class*='footer']"
  );
  if (footer) {
    extractEmailsStrict(footer.innerText ?? "", companyDomain).forEach((e) =>
      allEmails.add(e)
    );
  }

  // If homepage already has emails → return immediately
  if (allEmails.size > 0) {
    console.log(`[Approach Content] Found ${allEmails.size} email(s) on homepage`);
    return Array.from(allEmails);
  }

  // Layer 2: Crawl priority sub-pages (/contact, /about, /careers…)
  const pageLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("a[href]")
  )
    .map((a) => a.href)
    .filter((href) => {
      try {
        const url = new URL(href);
        return (
          url.hostname.includes(companyDomain) &&
          PRIORITY_PATHS.some((p) =>
            url.pathname.toLowerCase().includes(p.slice(1))
          )
        );
      } catch {
        return false;
      }
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

      if (allEmails.size > 0) {
        console.log(`[Approach Content] Found email(s) on: ${subUrl}`);
        break;
      }
    } catch {
      // Network error — continue
    }
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
    // STEP 2: Start LinkedIn Jobs scroll + company harvest
    if (message.type === "START_JOBS_SCRAPE") {
      startJobsScrape(message.duration);
      sendResponse({ started: true });
      return false; // LINKEDIN_SCRAPE_DONE fires later via runtime.sendMessage
    }

    // STEP 5: Extract company website from Google SERP
    if (message.type === "EXTRACT_COMPANY_WEBSITE") {
      const domain = extractCompanyWebsite(message.companyName);
      sendResponse({ domain });
      return false;
    }

    // STEP 6+7: Strict website crawl for real emails
    if (message.type === "CRAWL_WEBSITE_STRICT") {
      crawlWebsiteStrict(message.baseUrl).then((emails) => {
        sendResponse({ emails });
      });
      return true; // async
    }

    return false;
  }
);
