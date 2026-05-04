# LinkedIn Email Scraper — Chrome Extension

Automatically scrolls LinkedIn search results and extracts any emails found in posts, bios, and comments.

---

## Installation (Developer Mode)

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **Developer Mode** (toggle top-right)
3. Click **Load unpacked**
4. Select the `linkedin-email-scraper` folder
5. The extension icon will appear in your toolbar ✅

---

## How to Use

1. Go to **LinkedIn** and run any search (people, posts, companies)
2. Click the extension icon in your toolbar
3. Choose a scroll speed:
   - **SAFE** — 4s delay (recommended, avoids detection)
   - **NORMAL** — 2.5s delay (balanced)
   - **FAST** — 1.2s delay (risky, may trigger LinkedIn limits)
4. Click **▶ START** — the bot auto-scrolls and extracts emails in the background
5. Watch emails appear live in the popup
6. Click **⬇ CSV** to download all emails as a spreadsheet
7. Click **■ STOP** anytime to pause

---

## How It Works

- Injects a content script into the LinkedIn tab
- Auto-scrolls the page every N seconds
- A `MutationObserver` watches for new posts loading after each scroll
- Expands "See more" buttons to reveal hidden content
- Scans all text for email patterns using regex
- Deduplicates results and streams them live to the popup
- Detects end of page and stops automatically

---

## Tips

- Works best on **Posts** search tab (filter by Posts on LinkedIn)
- Emails are most commonly found in post bodies, comments, and bios
- Use **SAFE** speed if you're worried about your LinkedIn account
- The extension only works on `linkedin.com` pages

---

## Files

```
linkedin-email-scraper/
├── manifest.json     # Extension config
├── content.js        # Injected into LinkedIn — does the scrolling & scraping
├── background.js     # Service worker — stores emails across sessions
├── popup.html        # UI
├── popup.js          # Popup logic
└── icons/            # Extension icons
```
